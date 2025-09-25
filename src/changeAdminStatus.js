"use strict";

const utils = require("../utils");
const log = require("npmlog");

module.exports = function (defaultFuncs, api, ctx) {
	return function changeAdminStatus(threadID, adminIDs, adminStatus, callback) {
		if (utils.getType(threadID) !== "String") {
			throw new utils.CustomError({ error: "changeAdminStatus: threadID must be a string" });
		}

		if (utils.getType(adminIDs) === "String") {
			adminIDs = [adminIDs];
		}

		if (utils.getType(adminIDs) !== "Array") {
			throw new utils.CustomError({ error: "changeAdminStatus: adminIDs must be an array or string" });
		}

		if (utils.getType(adminStatus) !== "Boolean") {
			throw new utils.CustomError({ error: "changeAdminStatus: adminStatus must be a string" });
		}

		let resolveFunc = function () { };
		let rejectFunc = function () { };
		const returnPromise = new Promise(function (resolve, reject) {
			resolveFunc = resolve;
			rejectFunc = reject;
		});

		if (!callback) {
			callback = function (err) {
				if (err) {
					return rejectFunc(err);
				}
				resolveFunc();
			};
		}

		if (utils.getType(callback) !== "Function" && utils.getType(callback) !== "AsyncFunction") {
			throw new utils.CustomError({ error: "changeAdminStatus: callback is not a function" });
		}

		const form = {
			"thread_fbid": threadID
		};

		let i = 0;
		for (const u of adminIDs) {
			form[`admin_ids[${i++}]`] = u;
		}
		form["add"] = adminStatus;

		defaultFuncs
			.post("https://www.facebook.com/messaging/save_admins/?dpr=1", ctx.jar, form)
			.then(utils.parseAndCheckLogin(ctx, defaultFuncs))
			.then(function (resData) {
				if (resData.error) {
					switch (resData.error) {
						case 1976004:
							throw new utils.CustomError({ error: "Cannot alter admin status: you are not an admin.", rawResponse: resData });
						case 1357031:
							throw new utils.CustomError({ error: "Cannot alter admin status: this thread is not a group chat.", rawResponse: resData });
						default:
							throw new utils.CustomError({ error: "Cannot alter admin status: unknown error.", rawResponse: resData });
					}
				}

				callback();
			})
			.catch(function (err) {
				log.error("changeAdminStatus", err);
				return callback(err);
			});

		return returnPromise;
	};
};

