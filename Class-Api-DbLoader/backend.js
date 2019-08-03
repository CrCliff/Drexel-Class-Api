'use strict';

const convert = require('xml-js');
const mongoose = require('mongoose');
const request = require('request-promise');

const secret = require('./config/config.secret.json');

const config_common = require(secret['config_common']);
const secret_common = require(secret['secret_common']);

const classModel = require(secret_common['project_root'] + config_common['models']['class']['path']);
mongoose.model('Class', classModel.schema, 'classes');

const Class = mongoose.model('Class');

module.exports.getManyCourse = async (jsessionId, coursedisc) => {
    let options = {
        method: 'POST',
        url: 'https://dwapps.drexel.edu/dw/dashboard',
        qs:
        {
            COURSEDISC: String(coursedisc),
            COURSENUMB: '@',
            SCRIPT: 'SD2COURSEINFO',
            ContentType: 'xml'
        },
        headers:
        {
            'cache-control': 'no-cache',
            Cookie: 'JSESSIONID= ' + jsessionId
        }
    };

    var body = await request(options);

    /* replace double quotes in course name */
    if (coursedisc === 'COM') {
        body = body.replace('\"Fake News\"', '\'Fake News\'');
    }

    const json_body = convert.xml2js(body, { compact: false, spaces: 4 });

    if (!body) {
        return new Promise((_, reject) => {
            reject(body);
        });
    }

    const eles = json_body.elements[1].elements.slice(2);

    return Class.insertMany(eles.map(ele => {
        if (ele.name === 'Course') {
            let prereqs = ele.elements[1].elements;
            let sections = ele.elements[2].elements;

            return {
                Attributes: ele.attributes,
                Prereqs: prereqs
                    ? prereqs.map(preq => {
                        let p = preq.attributes;

                        if (p.SubjCodePreq && p.CrseNumbPreq) {
                            return `${p.Connector} ` + p.Lparen + p.SubjCodePreq + p.CrseNumbPreq + `-${p.MinGrde}` + p.Rparen;
                        }
                    }).join(' ').trim()
                    : "",
                Sections: sections
                    ? sections.map(section => {
                        section.Meetings = [].concat.apply([], section.elements.map(ele => {
                            return ele.elements
                                ? [].concat.apply([], ele.elements.map(ele_in => {
                                    return ele_in.attributes;
                                }))
                                : [];
                        }));
                        return section;
                    })
                    : []
            };
        }
    }));
};
