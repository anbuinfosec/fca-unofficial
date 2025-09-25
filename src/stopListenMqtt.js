// @anbuinfosec/fca-unofficial: Advanced and Safe Facebook Chat API
// stopListenMqtt.js - Stop listening to MQTT events

const utils = require('../utils');

module.exports = function (defaultFuncs, api, ctx){
  return function stopListenMqtt() {
    if (!ctx.mqttClient) {
      throw new Error("Not connected to MQTT");
    }
    utils.log("stopListenMqtt", "Stopping...");
    ctx.mqttClient.unsubscribe("/webrtc");
    ctx.mqttClient.unsubscribe("/rtc_multi");
    ctx.mqttClient.unsubscribe("/onevc");
    ctx.mqttClient.publish("/browser_close", "{}");
    ctx.mqttClient.end(false, (...data) => {
      utils.log("stopListenMqtt", "Stopped");
      ctx.mqttClient = null;
    });
  };
};
