// @anbuinfosec/fca-unofficial: Advanced and Safe Facebook Chat API
// changeUsername.js - Change your Facebook username

const utils = require('../utils');

module.exports = function (defaultFuncs, api, ctx) {
  return function changeUsername(username, callback) {
    let cb;
    let rt = new Promise(function (resolve, reject) {
      cb = (error, info) => info ? resolve(info) : reject(error);
    });

    if (typeof username == 'function') {
      let error = 'username must be a string, and not ' + utils.getType(username);
      utils.error('changeUsername', error);
      return username(error);
    }
    if (typeof callback == 'function') cb = callback;
    if (typeof username != 'string') {
      let error = 'username must be a string, and not ' + utils.getType(username);
      utils.error('changeUsername', error);
      return cb(error);
    }

    let form = {
      fb_api_caller_class: 'RelayModern',
      fb_api_req_friendly_name: 'useFXIMUpdateUsernameMutation',
      variables: JSON.stringify({
        client_mutation_id: utils.getGUID(),
        family_device_id: "device_id_fetch_datr",
        identity_ids: [ctx.userID],
        username,
        interface: "FB_WEB"
      }),
      server_timestamps: true,
      doc_id: 5737739449613305
    }

    defaultFuncs
      .post('https://accountscenter.facebook.com/api/graphql/', ctx.jar, form, null, null, {
        Origin: 'https://accountscenter.facebook.com',
        Referer: `https://accountscenter.facebook.com/profiles/${ctx.userID}/username/?entrypoint=fb_account_center`
      })
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (res) {
        if (res.errors) 
          throw res;
        else if (res.data.fxim_update_identity_username.error) 
          throw res.data.fxim_update_identity_username.error;
        return cb();
      })
      .catch(function (err) {
        utils.error('changeUsername', err);
        return cb(err);
      });
    return rt;
  }
}
