const request = require('request');
const convert = require('xml-js');
const async = require('async');
const subj_codes = require('./subjects.json');
const mongoose = require('mongoose');

require('../models/class');
const Class = mongoose.model('Class');

'use strict';

if (process.argv.length != 3) {
    console.log("Must have one parameter (JSESSIONID)!");
    process.exit();
}

const JSESSIONID = process.argv[2];
const LIVE_DB = 'mongodb://localhost:27017/drexel-schedule';

mongoose.connect(LIVE_DB);

module.exports.getManyCourse = (coursedisc, callback) => {
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
            Cookie: 'JSESSIONID= ' + JSESSIONID
        }
    };

    request(options, (err, resp, body) => {
        let retval = [];
        let count = 0;
        if (err) { console.error(err); callback(null) }

        /* replace double quotes in course name */
        if (coursedisc === 'COM') {
            body = body.replace('\"Fake News\"', '\'Fake News\'');
        }

        const json_body = convert.xml2js(body, { compact: false, spaces: 4 });

        if (!body) {
            retval.success = false;
            callback(retval);
            return;
        }

        const eles = json_body.elements[1].elements.slice(2);

        for (var i in eles) {
            const ele = eles[i];
            if (ele.name === 'Course') {
                let course = ele.attributes.SubjCode + ' ' + ele.attributes.CrseNumb;
                let prereqs = ele.elements[1].elements;
                let sections = ele.elements[2].elements;

                retval.push({});
                retval[count].Attributes = ele.attributes;
                if (!(prereqs)) {
                    retval[count].Prereqs = "";
                } else {
                    retval[count].Prereqs = prereqs.map(preq => {
                        let p = preq.attributes;

                        if (p.SubjCodePreq && p.CrseNumbPreq) {
                            return  `${p.Connector} ` + p.Lparen + p.SubjCodePreq + p.CrseNumbPreq + `-${p.MinGrde}` + p.Rparen;
                        }
                    }).join(' ').trim();
                }

                retval[count].Sections = [];
                for (var j in sections) {
                    retval[count].Sections[j] = sections[j].attributes;
                    retval[count].Sections[j].Meetings = [];
                    for (var k in sections[j].elements) {
                        for (var l in sections[j].elements[k].elements) {
                            retval[count].Sections[j].Meetings.push(sections[j].elements[k].elements[l].attributes);
                        }
                    }

                }

                if (!(retval[count].Attributes)) {
                    retval[count].success = false;
                    retval[count].error = 'No attributes for class.';
                }
                else {
                    retval[count].success = true;
                }
                count += 1;
            }
        }

        callback(retval);

    });
};

var count = 0;
subj_count = Object.keys(subj_codes).length;

async.forEachOf(subj_codes, (item, key, callback) => {

    module.exports.getManyCourse(key, (retval) => {
        for (var i in retval) {
            if (!(retval[i].success)) {
                console.error('Failure: ' + retval[i].error);
            }
        }
        Class.insertMany(retval, err => {
            if (err) { console.error(err); }
            count += 1;
            console.log('Done inserting classes for: ' + key);
            if (count == subj_count) {
                console.log('Done all classes.');
                mongoose.disconnect();
            }
        });
    });

    callback();
}, (err) => {
    if (err) { console.error(err); }
});

