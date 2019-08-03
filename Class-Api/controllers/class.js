const mongoose = require('mongoose');

const config = require('../config/config.json');
const secret = require('../config/config.secret.json');

const config_common = require(secret['config_common']);
const secret_common = require(secret['secret_common']);

const classModel = require(secret_common['project_root'] + config_common['models']['class']['path']);
const subj_codes = require(secret_common['project_root'] + config_common['data']['subjects']['path']);

mongoose.model('Class', classModel.schema, 'classes');

const Class = mongoose.model('Class');

const sendJSONResp = function (res, status, content) {
    res.status(status);
    res.json(content);
}

module.exports.getClass = (req, res) => {
    Class.find(req.query, (err, classes) => {
        if (err) {
            sendJSONResp(res, 404, err);
        } else if (classes.length == 0) {
            sendJSONResp(res, 204, {
                "message": "No classes found."
            });
        } else {
            sendJSONResp(res, 200, classes);
        }
    });
}

module.exports.getSubjList = (req, res) => {
    if (!(subj_codes)) {
        sendJSONResp(res, 500, {
            "message": "Can't get list of subjects right now."
        });
    } else {
        sendJSONResp(res, 200, subj_codes);
    }
}