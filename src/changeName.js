"use strict";

var utils = require('../utils.js');
var log = require('npmlog');

module.exports = function (http, api, ctx) {
  return function changeName(input, format, callback) {
    var cb;
    var returnPromise = new Promise(function (resolve, reject) {
      cb = error => error ? reject(error) : resolve();
    });

    if (typeof input == 'function') {
      callback = input;
      input = null;
    }
    if (typeof format == 'function') {
      callback = format;
      format = 'complete';
    }
    if (typeof callback == 'function') cb = callback;
    if (utils.getType(input) != 'Object') {
      var error = 'Name must be an object, not ' + utils.getType(input);
      log('changeName', error);
      return cb(error);
    } 

    var { first_name, middle_name, last_name } = input;
    if (!first_name || !last_name) {
      log.error('changeName', 'name is not be accepted');
      return cb('Name is not be accepted');
    }

    middle_name = middle_name || '';

    var full_name = 
      format == 'complete' ? last_name + ' ' + (middle_name != '' ? middle_name + ' ' : '') + first_name :
      format == 'standard' ? last_name + ' ' + first_name :
      format == 'reversed' ? first_name + ' ' + (middle_name != '' ? middle_name + ' ' : '') + last_name :
      last_name + ' ' + (middle_name != '' ? middle_name + ' ' : '') + first_name;

    var form = {
      fb_api_caller_class: 'RelayModern',
      fb_api_req_friendly_name: 'useFXIMUpdateNameMutation',
      variables: JSON.stringify({
        client_mutation_id: utils.getGUID(),
        family_device_id: "device_id_fetch_datr",
        identity_ids: [ctx.userID],
        full_name, 
        first_name,
        middle_name, 
        last_name,
        interface: 'FB_WEB'
      }),
      server_timestamps: true,
      doc_id: '5763510853763960'
    }

    http
      .post('https://accountscenter.facebook.com/api/graphql/', ctx.jar, form, null, null, {
        Origin: 'https://accountscenter.facebook.com',
        Referer: `https://accountscenter.facebook.com/profiles/${ctx.userID}/name`
      })
      .then(utils.parseAndCheckLogin(ctx, http))
      .then(function (res) {
        if (res.errors) 
          throw res;
        else if (res.data.fxim_update_identity_name.error) 
          throw res.data.fxim_update_identity_name.error;
        return cb();
      })
      .catch(function (err) {
        log.error('changeName', err);
        return cb(err);
      });

    return returnPromise;
  }
}
