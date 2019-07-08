const mongoose = require('mongoose');
const Class = mongoose.model('Class');

const subj_codes = require('./subjects.json');

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