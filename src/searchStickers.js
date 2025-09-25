// @anbuinfosec/fca-unofficial: Advanced and Safe Facebook Chat API
// searchStickers.js - Search for Facebook stickers

const utils = require('../utils.js');

module.exports = function (http, api, ctx) {
  function formatData(res) {
    return {
      id: res.node.id,
      image: res.node.image,
      package: res.node.pack != null ? {
        name: res.node.pack.name,
        id: res.node.pack.id
      } : {},
      label: res.node.label
    };
  }
  
  return function searchStickers(query = '', callback) {
    let cb;
    const returnPromise = new Promise(function (resolve, reject) {
      cb = function (error, data) {
        data ? resolve(data) : reject(error);
      };
    });

    if (typeof callback == 'function') cb = callback;

    const form = {
      fb_api_req_friendly_name: 'StickersFlyoutTagSelectorQuery',
      variables: JSON.stringify({
        stickerWidth: 64,
        stickerHeight: 64,
        stickerInterface: 'messages',
        query
      }),
      doc_id: '4642836929159953'
    };
    http
      .post('https://www.facebook.com/api/graphql/', ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, http))
      .then(function (res) {
        return cb(null, res.data.sticker_search.sticker_results.edges.map(formatData));
      })
      .catch(function (err) {
        utils.error('searchStickers', err);
        return cb(err);
      });
    return returnPromise;
  };
};
