'use strict';

const webdriver = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const mongoose = require('mongoose');
const async = require('async');
const backend = require('./backend.js');

const config = require('./config/config.json');
const secret = require('./config/config.secret.json');

const config_common = require(secret['config_common']);
const secret_common = require(secret['secret_common']);

const subj_codes_json = require(secret_common['project_root'] + config_common['data']['subjects']['path']);

const Class = mongoose.model('Class');
const driver = new webdriver.Builder()
  .forBrowser('firefox')
  .build();

const subj_codes = Object.keys(subj_codes_json);

const endpoint = config['mongoose']['endpoint'];
const resource = config['mongoose']['resource'];
mongoose.connect(endpoint + resource);

function dropCollectionPromisified (obj, ret) {
  return new Promise( (resolve, reject) => {
    if (obj.collection) {
      obj.collection.drop((err, reply) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(ret);
        }
      });
    }
    resolve(ret);
  });
}

driver.get(config['drexel-one']['url'])
.then(() => {
  return driver
    .findElement(webdriver.By.name('j_username'))
    .sendKeys(secret['drexel-one']['username'])
}).then(() => {
  return driver
    .findElement(webdriver.By.name('j_password'))
    .sendKeys(secret['drexel-one']['password']);
}).then(() => {
  return driver
    .findElement(webdriver.By.name('_eventId_proceed')).click();
}).then(() => {
  return driver.get(config['degree-works']['url']);
}).then(() => {
  return driver.manage().getCookies();
}).then(cookies => {
  return new Promise( (resolve, reject) => {
    resolve(
      // get value of JSESSIONID cookie
      cookies.find(cookie => cookie.name == 'JSESSIONID').value
    );
  });
}).then((jsessionId) => {
  return dropCollectionPromisified(Class, jsessionId);
}).then(jsessionId => {
  var promises = subj_codes.map(key => {
    return backend.getManyCourse(jsessionId, key)
  });

  return Promise.all(promises);
}).then(() => {
  driver.quit();
  mongoose.disconnect();
  console.log('Done inserting classes');
}).catch(err => {
  console.log(err);
});
