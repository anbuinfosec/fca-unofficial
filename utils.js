"use strict";
var url = require("url");
const log = require("npmlog");
const stream = require("stream");
const bluebird = require("bluebird");
const querystring = require("querystring");
const request = bluebird.promisify(require("request").defaults({ jar: true }));

class CustomError extends Error {
    constructor(obj) {
        if (typeof obj === 'string')
            obj = { message: obj };
        if (typeof obj !== 'object' || obj === null)
            throw new TypeError('Object required');
        obj.message ? super(obj.message) : super();
        Object.assign(this, obj);
    }
}

function tryPromise(tryFunc) {
    return new Promise((resolve, reject) => {
        try {
            resolve(tryFunc());
        } catch (error) {
            reject(error);
        }
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setProxy(url) {
    if (typeof url == "undefined") return request = bluebird.promisify(require("request").defaults({ jar: true }));
    return request = bluebird.promisify(require("request").defaults({ jar: true, proxy: url }));
}

function getHeaders(url, options, ctx, customHeader) {
    var headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "https://www.facebook.com/",
        Host: url.replace("https://", "").split("/")[0],
        Origin: "https://www.facebook.com",
        "user-agent": (options?.userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 Safari/537.36"),
        Connection: "keep-alive",
        "sec-fetch-site": 'same-origin',
        "sec-fetch-mode": 'cors'
    };
    if (customHeader) Object.assign(headers, customHeader);
    if (ctx && ctx.region) headers["X-MSGR-Region"] = ctx.region;

    return headers;
}

function isReadableStream(obj) {
    return (
        obj instanceof stream.Stream &&
        (getType(obj._read) === "Function" ||
            getType(obj._read) === "AsyncFunction") &&
        getType(obj._readableState) === "Object"
    );
}

function get(url, jar, qs, options, ctx) {
    if (getType(qs) === "Object")
        for (var prop in qs)
            if (qs.hasOwnProperty(prop) && getType(qs[prop]) === "Object") qs[prop] = JSON.stringify(qs[prop]);
    var op = {
        headers: getHeaders(url, options, ctx),
        timeout: 60000,
        qs: qs,
        url: url,
        method: "GET",
        jar: jar,
        gzip: true
    };
    return request(op).then(function (res) {
        return res;
    });
}

function get2(url, jar, headers, options, ctx) {
    var op = {
        headers: getHeaders(url, options, ctx, headers),
        timeout: 60000,
        url: url,
        method: "GET",
        jar: jar,
        gzip: true,
    };

    return request(op).then(function (res) {
        return res[0];
    });
}

function post(url, jar, form, options, ctx, customHeader) {
    var op = {
        headers: getHeaders(url, options),
        timeout: 60000,
        url: url,
        method: "POST",
        form: form,
        jar: jar,
        gzip: true
    };
    return request(op).then(function (res) {
        return res;
    });
}

function postFormData(url, jar, form, qs, options, ctx) {
    var headers = getHeaders(url, options, ctx);
    headers["Content-Type"] = "multipart/form-data";
    var op = {
        headers: headers,
        timeout: 60000,
        url: url,
        method: "POST",
        formData: form,
        qs: qs,
        jar: jar,
        gzip: true
    };

    return request(op).then(function (res) {
        return res;
    });
}

function padZeros(val, len) {
    val = String(val);
    len = len || 2;
    while (val.length < len) val = "0" + val;
    return val;
}

function generateThreadingID(clientID) {
    var k = Date.now();
    var l = Math.floor(Math.random() * 4294967295);
    var m = clientID;
    return "<" + k + ":" + l + "-" + m + "@mail.projektitan.com>";
}

function binaryToDecimal(data) {
    var ret = "";
    while (data !== "0") {
        var end = 0;
        var fullName = "";
        var i = 0;
        for (; i < data.length; i++) {
            end = 2 * end + parseInt(data[i], 10);
            if (end >= 10) {
                fullName += "1";
                end -= 10;
            } else fullName += "0";
        }
        ret = end.toString() + ret;
        data = fullName.slice(fullName.indexOf("1"));
    }
    return ret;
}

function generateOfflineThreadingID() {
    var ret = Date.now();
    var value = Math.floor(Math.random() * 4294967295);
    var str = ("0000000000000000000000" + value.toString(2)).slice(-22);
    var msgs = ret.toString(2) + str;
    return binaryToDecimal(msgs);
}

var h;
var i = {};
var j = {
    _: "%",
    A: "%2",
    B: "000",
    C: "%7d",
    D: "%7b%22",
    E: "%2c%22",
    F: "%22%3a",
    G: "%2c%22ut%22%3a1",
    H: "%2c%22bls%22%3a",
    I: "%2c%22n%22%3a%22%",
    J: "%22%3a%7b%22i%22%3a0%7d",
    K: "%2c%22pt%22%3a0%2c%22vis%22%3a",
    L: "%2c%22ch%22%3a%7b%22h%22%3a%22",
    M: "%7b%22v%22%3a2%2c%22time%22%3a1",
    N: ".channel%22%2c%22sub%22%3a%5b",
    O: "%2c%22sb%22%3a1%2c%22t%22%3a%5b",
    P: "%2c%22ud%22%3a100%2c%22lc%22%3a0",
    Q: "%5d%2c%22f%22%3anull%2c%22uct%22%3a",
    R: ".channel%22%2c%22sub%22%3a%5b1%5d",
    S: "%22%2c%22m%22%3a0%7d%2c%7b%22i%22%3a",
    T: "%2c%22blc%22%3a1%2c%22snd%22%3a1%2c%22ct%22%3a",
    U: "%2c%22blc%22%3a0%2c%22snd%22%3a1%2c%22ct%22%3a",
    V: "%2c%22blc%22%3a0%2c%22snd%22%3a0%2c%22ct%22%3a",
    W: "%2c%22s%22%3a0%2c%22blo%22%3a0%7d%2c%22bl%22%3a%7b%22ac%22%3a",
    X: "%2c%22ri%22%3a0%7d%2c%22state%22%3a%7b%22p%22%3a0%2c%22ut%22%3a1",
    Y: "%2c%22pt%22%3a0%2c%22vis%22%3a1%2c%22bls%22%3a0%2c%22blc%22%3a0%2c%22snd%22%3a1%2c%22ct%22%3a",
    Z: "%2c%22sb%22%3a1%2c%22t%22%3a%5b%5d%2c%22f%22%3anull%2c%22uct%22%3a0%2c%22s%22%3a0%2c%22blo%22%3a0%7d%2c%22bl%22%3a%7b%22ac%22%3a"
};
(function () {
    var l = [];
    for (var m in j) {
        i[j[m]] = m;
        l.push(j[m]);
    }
    l.reverse();
    h = new RegExp(l.join("|"), "g");
})();

function presenceEncode(str) {
    return encodeURIComponent(str)
        .replace(/([_A-Z])|%../g, function (m, n) {
            return n ? "%" + n.charCodeAt(0).toString(16) : m;
        })
        .toLowerCase()
        .replace(h, function (m) {
            return i[m];
        });
}

function presenceDecode(str) {
    return decodeURIComponent(
        str.replace(/[_A-Z]/g, function (/** @type {string | number} */m) {
            return j[m];
        })
    );
}

function generatePresence(userID) {
    var time = Date.now();
    return (
        "E" +
        presenceEncode(
            JSON.stringify({
                v: 3,
                time: parseInt(time / 1000, 10),
                user: userID,
                state: {
                    ut: 0,
                    t2: [],
                    lm2: null,
                    uct2: time,
                    tr: null,
                    tw: Math.floor(Math.random() * 4294967295) + 1,
                    at: time
                },
                ch: {
                    ["p_" + userID]: 0
                }
            })
        )
    );
}

function generateAccessiblityCookie() {
    var time = Date.now();
    return encodeURIComponent(
        JSON.stringify({
            sr: 0,
            "sr-ts": time,
            jk: 0,
            "jk-ts": time,
            kb: 0,
            "kb-ts": time,
            hcm: 0,
            "hcm-ts": time
        })
    );
}

function getGUID() {
    /** @type {number} */

    var sectionLength = Date.now();
    /** @type {string} */

    var id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        /** @type {number} */

        var r = Math.floor((sectionLength + Math.random() * 16) % 16);
        /** @type {number} */

        sectionLength = Math.floor(sectionLength / 16);
        /** @type {string} */

        var _guid = (c == "x" ? r : (r & 7) | 8).toString(16);
        return _guid;
    });
    return id;
}

function _formatAttachment(attachment1, attachment2) {
    attachment2 = attachment2 || { id: "", image_data: {} };
    attachment1 = attachment1.mercury ? attachment1.mercury : attachment1;
    var blob = attachment1.blob_attachment;
    var type =
        blob && blob.__typename ? blob.__typename : attachment1.attach_type;
    if (!type && attachment1.sticker_attachment) {
        type = "StickerAttachment";
        blob = attachment1.sticker_attachment;
    } else if (!type && attachment1.extensible_attachment) {
        if (
            attachment1.extensible_attachment.story_attachment &&
            attachment1.extensible_attachment.story_attachment.target &&
            attachment1.extensible_attachment.story_attachment.target.__typename &&
            attachment1.extensible_attachment.story_attachment.target.__typename === "MessageLocation"
        ) type = "MessageLocation";
        else type = "ExtensibleAttachment";

        blob = attachment1.extensible_attachment;
    }
    switch (type) {
        case "sticker":
            return {
                type: "sticker",
                ID: attachment1.metadata.stickerID.toString(),
                url: attachment1.url,

                packID: attachment1.metadata.packID.toString(),
                spriteUrl: attachment1.metadata.spriteURI,
                spriteUrl2x: attachment1.metadata.spriteURI2x,
                width: attachment1.metadata.width,
                height: attachment1.metadata.height,

                caption: attachment2.caption,
                description: attachment2.description,

                frameCount: attachment1.metadata.frameCount,
                frameRate: attachment1.metadata.frameRate,
                framesPerRow: attachment1.metadata.framesPerRow,
                framesPerCol: attachment1.metadata.framesPerCol,

                stickerID: attachment1.metadata.stickerID.toString(), // @Legacy
                spriteURI: attachment1.metadata.spriteURI, // @Legacy
                spriteURI2x: attachment1.metadata.spriteURI2x // @Legacy
            };
        case "file":
            return {
                type: "file",
                filename: attachment1.name,
                ID: attachment2.id.toString(),
                url: attachment1.url,

                isMalicious: attachment2.is_malicious,
                contentType: attachment2.mime_type,

                name: attachment1.name, // @Legacy
                mimeType: attachment2.mime_type, // @Legacy
                fileSize: attachment2.file_size // @Legacy
            };
        case "photo":
            return {
                type: "photo",
                ID: attachment1.metadata.fbid.toString(),
                filename: attachment1.fileName,
                thumbnailUrl: attachment1.thumbnail_url,

                previewUrl: attachment1.preview_url,
                previewWidth: attachment1.preview_width,
                previewHeight: attachment1.preview_height,

                largePreviewUrl: attachment1.large_preview_url,
                largePreviewWidth: attachment1.large_preview_width,
                largePreviewHeight: attachment1.large_preview_height,

                url: attachment1.metadata.url, // @Legacy
                width: attachment1.metadata.dimensions.split(",")[0], // @Legacy
                height: attachment1.metadata.dimensions.split(",")[1], // @Legacy
                name: attachment1.fileName // @Legacy
            };
        case "animated_image":
            return {
                type: "animated_image",
                ID: attachment2.id.toString(),
                filename: attachment2.filename,

                previewUrl: attachment1.preview_url,
                previewWidth: attachment1.preview_width,
                previewHeight: attachment1.preview_height,

                url: attachment2.image_data.url,
                width: attachment2.image_data.width,
                height: attachment2.image_data.height,

                name: attachment1.name, // @Legacy
                facebookUrl: attachment1.url, // @Legacy
                thumbnailUrl: attachment1.thumbnail_url, // @Legacy
                mimeType: attachment2.mime_type, // @Legacy
                rawGifImage: attachment2.image_data.raw_gif_image, // @Legacy
                rawWebpImage: attachment2.image_data.raw_webp_image, // @Legacy
                animatedGifUrl: attachment2.image_data.animated_gif_url, // @Legacy
                animatedGifPreviewUrl: attachment2.image_data.animated_gif_preview_url, // @Legacy
                animatedWebpUrl: attachment2.image_data.animated_webp_url, // @Legacy
                animatedWebpPreviewUrl: attachment2.image_data.animated_webp_preview_url // @Legacy
            };
        case "share":
            return {
                type: "share",
                ID: attachment1.share.share_id.toString(),
                url: attachment2.href,

                title: attachment1.share.title,
                description: attachment1.share.description,
                source: attachment1.share.source,

                image: attachment1.share.media.image,
                width: attachment1.share.media.image_size.width,
                height: attachment1.share.media.image_size.height,
                playable: attachment1.share.media.playable,
                duration: attachment1.share.media.duration,

                subattachments: attachment1.share.subattachments,
                properties: {},

                animatedImageSize: attachment1.share.media.animated_image_size, // @Legacy
                facebookUrl: attachment1.share.uri, // @Legacy
                target: attachment1.share.target, // @Legacy
                styleList: attachment1.share.style_list // @Legacy
            };
        case "video":
            return {
                type: "video",
                ID: attachment1.metadata.fbid.toString(),
                filename: attachment1.name,

                previewUrl: attachment1.preview_url,
                previewWidth: attachment1.preview_width,
                previewHeight: attachment1.preview_height,

                url: attachment1.url,
                width: attachment1.metadata.dimensions.width,
                height: attachment1.metadata.dimensions.height,

                duration: attachment1.metadata.duration,
                videoType: "unknown",

                thumbnailUrl: attachment1.thumbnail_url // @Legacy
            };
        case "error":
            return {
                type: "error",
                attachment1: attachment1,
                attachment2: attachment2
            };
        case "MessageImage":
            return {
                type: "photo",
                ID: blob.legacy_attachment_id,
                filename: blob.filename,
                thumbnailUrl: blob.thumbnail.uri,

                previewUrl: blob.preview.uri,
                previewWidth: blob.preview.width,
                previewHeight: blob.preview.height,

                largePreviewUrl: blob.large_preview.uri,
                largePreviewWidth: blob.large_preview.width,
                largePreviewHeight: blob.large_preview.height,

                url: blob.large_preview.uri, // @Legacy
                width: blob.original_dimensions.x, // @Legacy
                height: blob.original_dimensions.y, // @Legacy
                name: blob.filename // @Legacy
            };
        case "MessageAnimatedImage":
            return {
                type: "animated_image",
                ID: blob.legacy_attachment_id,
                filename: blob.filename,

                previewUrl: blob.preview_image.uri,
                previewWidth: blob.preview_image.width,
                previewHeight: blob.preview_image.height,

                url: blob.animated_image.uri,
                width: blob.animated_image.width,
                height: blob.animated_image.height,

                thumbnailUrl: blob.preview_image.uri, // @Legacy
                name: blob.filename, // @Legacy
                facebookUrl: blob.animated_image.uri, // @Legacy
                rawGifImage: blob.animated_image.uri, // @Legacy
                animatedGifUrl: blob.animated_image.uri, // @Legacy
                animatedGifPreviewUrl: blob.preview_image.uri, // @Legacy
                animatedWebpUrl: blob.animated_image.uri, // @Legacy
                animatedWebpPreviewUrl: blob.preview_image.uri // @Legacy
            };
        case "MessageVideo":
            return {
                type: "video",
                filename: blob.filename,
                ID: blob.legacy_attachment_id,

                previewUrl: blob.large_image.uri,
                previewWidth: blob.large_image.width,
                previewHeight: blob.large_image.height,

                url: blob.playable_url,
                width: blob.original_dimensions.x,
                height: blob.original_dimensions.y,

                duration: blob.playable_duration_in_ms,
                videoType: blob.video_type.toLowerCase(),

                thumbnailUrl: blob.large_image.uri // @Legacy
            };
        case "MessageAudio":
            return {
                type: "audio",
                filename: blob.filename,
                ID: blob.url_shimhash,

                audioType: blob.audio_type,
                duration: blob.playable_duration_in_ms,
                url: blob.playable_url,

                isVoiceMail: blob.is_voicemail
            };
        case "StickerAttachment":
            return {
                type: "sticker",
                ID: blob.id,
                url: blob.url,

                packID: blob.pack ? blob.pack.id : null,
                spriteUrl: blob.sprite_image,
                spriteUrl2x: blob.sprite_image_2x,
                width: blob.width,
                height: blob.height,

                caption: blob.label,
                description: blob.label,

                frameCount: blob.frame_count,
                frameRate: blob.frame_rate,
                framesPerRow: blob.frames_per_row,
                framesPerCol: blob.frames_per_column,

                stickerID: blob.id, // @Legacy
                spriteURI: blob.sprite_image, // @Legacy
                spriteURI2x: blob.sprite_image_2x // @Legacy
            };
        case "MessageLocation":
            var urlAttach = blob.story_attachment.url;
            var mediaAttach = blob.story_attachment.media;

            var u = querystring.parse(url.parse(urlAttach).query).u;
            var where1 = querystring.parse(url.parse(u).query).where1;
            var address = where1.split(", ");

            var latitude;
            var longitude;

            try {
                latitude = Number.parseFloat(address[0]);
                longitude = Number.parseFloat(address[1]);
            } catch (err) {
                /* empty */

            }

            var imageUrl;
            var width;
            var height;

            if (mediaAttach && mediaAttach.image) {
                imageUrl = mediaAttach.image.uri;
                width = mediaAttach.image.width;
                height = mediaAttach.image.height;
            }

            return {
                type: "location",
                ID: blob.legacy_attachment_id,
                latitude: latitude,
                longitude: longitude,
                image: imageUrl,
                width: width,
                height: height,
                url: u || urlAttach,
                address: where1,

                facebookUrl: blob.story_attachment.url, // @Legacy
                target: blob.story_attachment.target, // @Legacy
                styleList: blob.story_attachment.style_list // @Legacy
            };
        case "ExtensibleAttachment":
            return {
                type: "share",
                ID: blob.legacy_attachment_id,
                url: blob.story_attachment.url,

                title: blob.story_attachment.title_with_entities.text,
                description: blob.story_attachment.description &&
                    blob.story_attachment.description.text,
                source: blob.story_attachment.source ? blob.story_attachment.source.text : null,

                image: blob.story_attachment.media &&
                    blob.story_attachment.media.image &&
                    blob.story_attachment.media.image.uri,
                width: blob.story_attachment.media &&
                    blob.story_attachment.media.image &&
                    blob.story_attachment.media.image.width,
                height: blob.story_attachment.media &&
                    blob.story_attachment.media.image &&
                    blob.story_attachment.media.image.height,
                playable: blob.story_attachment.media &&
                    blob.story_attachment.media.is_playable,
                duration: blob.story_attachment.media &&
                    blob.story_attachment.media.playable_duration_in_ms,
                playableUrl: blob.story_attachment.media == null ? null : blob.story_attachment.media.playable_url,

                subattachments: blob.story_attachment.subattachments,
                properties: blob.story_attachment.properties.reduce(function (/** @type {{ [x: string]: any; }} */obj, /** @type {{ key: string | number; value: { text: any; }; }} */cur) {
                    obj[cur.key] = cur.value.text;
                    return obj;
                }, {}),

                facebookUrl: blob.story_attachment.url, // @Legacy
                target: blob.story_attachment.target, // @Legacy
                styleList: blob.story_attachment.style_list // @Legacy
            };
        case "MessageFile":
            return {
                type: "file",
                filename: blob.filename,
                ID: blob.message_file_fbid,

                url: blob.url,
                isMalicious: blob.is_malicious,
                contentType: blob.content_type,

                name: blob.filename,
                mimeType: "",
                fileSize: -1
            };
        default:
            throw new Error(
                "unrecognized attach_file of type " +
                type +
                "`" +
                JSON.stringify(attachment1, null, 4) +
                " attachment2: " +
                JSON.stringify(attachment2, null, 4) +
                "`"
            );
    }
}

function formatAttachment(attachments, attachmentIds, attachmentMap, shareMap) {
    attachmentMap = shareMap || attachmentMap;
    return attachments ?
        attachments.map(function (i) {
            if (!attachmentMap ||
                !attachmentIds ||
                !attachmentMap[attachmentIds[i]]
            ) {
                return _formatAttachment(val);
            }
            return _formatAttachment(val, attachmentMap[attachmentIds[i]]);
        }) : [];
}

function formatDeltaMessage(m) {
    var md = m.messageMetadata;
    var mdata =
        m.data === undefined ? [] :
            m.data.prng === undefined ? [] :
                JSON.parse(m.data.prng);
    var m_id = mdata.map((/** @type {{ i: any; }} */u) => u.i);
    var m_offset = mdata.map((/** @type {{ o: any; }} */u) => u.o);
    var m_length = mdata.map((/** @type {{ l: any; }} */u) => u.l);
    var mentions = {};
    var body = m.body || "";
    var args = body == "" ? [] : body.trim().split(/\s+/);
    for (var i = 0; i < m_id.length; i++) mentions[m_id[i]] = m.body.substring(m_offset[i], m_offset[i] + m_length[i]);
    return {
        type: "message",
        senderID: formatID(md.actorFbId.toString()),
        threadID: formatID((md.threadKey.threadFbId || md.threadKey.otherUserFbId).toString()),
        messageID: md.messageId,
        args: args,
        body: body,
        attachments: (m.attachments || []).map((/** @type {any} */v) => _formatAttachment(v)),
        mentions: mentions,
        timestamp: md.timestamp,
        isGroup: !!md.threadKey.threadFbId,
        participantIDs: m.participants || []
    };
}

function formatID(id) {
    if (id != undefined && id != null) return id.replace(/(fb)?id[:.]/, "");
    else return id;
}

function formatMessage(m) {
    var originalMessage = m.message ? m.message : m;
    var obj = {
        type: "message",
        senderName: originalMessage.sender_name,
        senderID: formatID(originalMessage.sender_fbid.toString()),
        participantNames: originalMessage.group_thread_info ? originalMessage.group_thread_info.participant_names : [originalMessage.sender_name.split(" ")[0]],
        participantIDs: originalMessage.group_thread_info ?
            originalMessage.group_thread_info.participant_ids.map(function (v) {
                return formatID(v.toString());
            }) : [formatID(originalMessage.sender_fbid)],
        body: originalMessage.body || "",
        threadID: formatID((originalMessage.thread_fbid || originalMessage.other_user_fbid).toString()),
        threadName: originalMessage.group_thread_info ? originalMessage.group_thread_info.name : originalMessage.sender_name,
        location: originalMessage.coordinates ? originalMessage.coordinates : null,
        messageID: originalMessage.mid ? originalMessage.mid.toString() : originalMessage.message_id,
        attachments: formatAttachment(
            originalMessage.attachments,
            originalMessage.attachmentIds,
            originalMessage.attachment_map,
            originalMessage.share_map
        ),
        timestamp: originalMessage.timestamp,
        timestampAbsolute: originalMessage.timestamp_absolute,
        timestampRelative: originalMessage.timestamp_relative,
        timestampDatetime: originalMessage.timestamp_datetime,
        tags: originalMessage.tags,
        reactions: originalMessage.reactions ? originalMessage.reactions : [],
        isUnread: originalMessage.is_unread
    };
    if (m.type === "pages_messaging") obj.pageID = m.realtime_viewer_fbid.toString();
    obj.isGroup = obj.participantIDs.length > 2;
    return obj;
}

function formatEvent(m) {
    var originalMessage = m.message ? m.message : m;
    var logMessageType = originalMessage.log_message_type;
    var logMessageData;
    if (logMessageType === "log:generic-admin-text") {
        logMessageData = originalMessage.log_message_data.untypedData;
        logMessageType = getAdminTextMessageType(originalMessage.log_message_data.message_type);
    } else logMessageData = originalMessage.log_message_data;
    return Object.assign(formatMessage(originalMessage), {
        type: "event",
        logMessageType: logMessageType,
        logMessageData: logMessageData,
        logMessageBody: originalMessage.log_message_body
    });
}

function formatHistoryMessage(m) {
    switch (m.action_type) {
        case "ma-type:log-message":
            return formatEvent(m);
        default:
            return formatMessage(m);
    }
}

function getAdminTextMessageType(m) {
    switch (m.type) {
        case "joinable_group_link_mode_change":
            return "log:link-status";
        case "magic_words":
            return "log:magic-words";
        case "change_thread_theme":
            return "log:thread-color";
        case "change_thread_icon":
        case "change_thread_quick_reaction":
            return "log:thread-icon";
        case "change_thread_nickname":
            return "log:user-nickname";
        case "change_thread_admins":
            return "log:thread-admins";
        case "group_poll":
            return "log:thread-poll";
        case "change_thread_approval_mode":
            return "log:thread-approval-mode";
        case "messenger_call_log":
        case "participant_joined_group_call":
            return "log:thread-call";
        case "pin_messages_v2":
            return "log:thread-pinned";
        case 'unpin_messages_v2':
            return 'log:unpin-message';
        default:
            return m.type;
    }
}

function formatDeltaEvent(m) {
    var logMessageType;
    var logMessageData;
    switch (m.class) {
        case "AdminTextMessage":
            logMessageType = getAdminTextMessageType(m);
            logMessageData = m.untypedData;
            break;
        case "ThreadName":
            logMessageType = "log:thread-name";
            logMessageData = { name: m.name };
            break;
        case "ParticipantsAddedToGroupThread":
            logMessageType = "log:subscribe";
            logMessageData = { addedParticipants: m.addedParticipants };
            break;
        case "ParticipantLeftGroupThread":
            logMessageType = "log:unsubscribe";
            logMessageData = { leftParticipantFbId: m.leftParticipantFbId };
            break;
        case "UserLocation": {
            logMessageType = "log:user-location";
            logMessageData = {
                Image: m.attachments[0].mercury.extensible_attachment.story_attachment.media.image,
                Location: m.attachments[0].mercury.extensible_attachment.story_attachment.target.location_title,
                coordinates: m.attachments[0].mercury.extensible_attachment.story_attachment.target.coordinate,
                url: m.attachments[0].mercury.extensible_attachment.story_attachment.url
            };
        }
        case "ApprovalQueue":
            logMessageType = "log:approval-queue";
            logMessageData = {
                approvalQueue: {
                    action: m.action,
                    recipientFbId: m.recipientFbId,
                    requestSource: m.requestSource,
                    ...m.messageMetadata
                }
            };
    }
    return {
        type: "event",
        threadID: formatID((m.messageMetadata.threadKey.threadFbId || m.messageMetadata.threadKey.otherUserFbId).toString()),
        logMessageType: logMessageType,
        logMessageData: logMessageData,
        logMessageBody: m.messageMetadata.adminText,
        author: m.messageMetadata.actorFbId,
        participantIDs: (m?.participants || []).map((e) => e.toString())
    };
}

function formatTyp(event) {
    return {
        isTyping: !!event.st,
        from: event.from.toString(),
        threadID: formatID((event.to || event.thread_fbid || event.from).toString()),
        fromMobile: event.hasOwnProperty("from_mobile") ? event.from_mobile : true,
        userID: (event.realtime_viewer_fbid || event.from).toString(),
        type: "typ"
    };
}

function formatDeltaReadReceipt(delta) {
    return {
        reader: (delta.threadKey.otherUserFbId || delta.actorFbId).toString(),
        time: delta.actionTimestampMs,
        threadID: formatID((delta.threadKey.otherUserFbId || delta.threadKey.threadFbId).toString()),
        type: "read_receipt"
    };
}

function formatReadReceipt(event) {
    return {
        reader: event.reader.toString(),
        time: event.time,
        threadID: formatID((event.thread_fbid || event.reader).toString()),
        type: "read_receipt"
    };
}

function formatRead(event) {
    return {
        threadID: formatID(((event.chat_ids && event.chat_ids[0]) || (event.thread_fbids && event.thread_fbids[0])).toString()),
        time: event.timestamp,
        type: "read"
    };
}

function getFrom(str, startToken, endToken) {
    var start = str.indexOf(startToken) + startToken.length;
    if (start < startToken.length) return "";
    var lastHalf = str.substring(start);
    var end = lastHalf.indexOf(endToken);
    if (end === -1) throw Error("Could not find endTime `" + endToken + "` in the given string.");
    return lastHalf.substring(0, end);
}

function getFroms(str, startToken, endToken) {
    let results = [];
    let currentIndex = 0;
    while (true) {
        let start = str.indexOf(startToken, currentIndex);
        if (start === -1) break;
        start += startToken.length;
        let lastHalf = str.substring(start);
        let end = lastHalf.indexOf(endToken);
        if (end === -1) {
            if (results.length === 0) {
                throw Error("Could not find endToken `" + endToken + "` in the given string.");
            }
            break;
        }
        results.push(lastHalf.substring(0, end));
        currentIndex = start + end + endToken.length;
    }
    return results.length === 0 ? "" : results.length === 1 ? results[0] : results;
}

function makeParsable(html) {
    let withoutForLoop = html.replace(/for\s*\(\s*;\s*;\s*\)\s*;\s*/, "");
    let maybeMultipleObjects = withoutForLoop.split(/\}\r\n *\{/);
    if (maybeMultipleObjects.length === 1) return maybeMultipleObjects;
    return "[" + maybeMultipleObjects.join("},{") + "]";
}

function arrToForm(form) {
    return arrayToObject(form,
        function (v) {
            return v.name;
        },
        function (v) {
            return v.val;
        }
    );
}

function arrayToObject(arr, getKey, getValue) {
    return arr.reduce(function (acc, val) {
        acc[getKey(val)] = getValue(val);
        return acc;
    }, {});
}

function getSignatureID() {
    return Math.floor(Math.random() * 2147483648).toString(16);
}

function generateTimestampRelative() {
    var d = new Date();
    return d.getHours() + ":" + padZeros(d.getMinutes());
}

function makeDefaults(html, userID, ctx) {
    var reqCounter = 1;
    const fb_dtsg = getFrom(html, '"DTSGInitData",[],{"token":"', '",');
    var ttstamp = "2";
    for (var i = 0; i < fb_dtsg.length; i++) ttstamp += fb_dtsg.charCodeAt(i);
    var revision = getFrom(html, 'revision":', ",");
    function mergeWithDefaults(obj) {
        var newObj = {
            __user: userID,
            __req: (reqCounter++).toString(36),
            __rev: revision,
            __a: 1,
            fb_dtsg: ctx.fb_dtsg ? ctx.fb_dtsg : fb_dtsg,
            jazoest: ctx.ttstamp ? ctx.ttstamp : ttstamp
        };
        if (!obj) return newObj;
        for (var prop in obj)
            if (obj.hasOwnProperty(prop))
                if (!newObj[prop]) newObj[prop] = obj[prop];
        return newObj;
    }
    function postWithDefaults(url, jar, form, ctxx) {
        return post(url, jar, mergeWithDefaults(form), ctx.globalOptions, ctxx || ctx);
    }
    function getWithDefaults(url, jar, qs, ctxx) {
        return get(url, jar, mergeWithDefaults(qs), ctx.globalOptions, ctxx || ctx);
    }
    function postFormDataWithDefault(url, jar, form, qs, ctxx) {
        return postFormData(url, jar, mergeWithDefaults(form), mergeWithDefaults(qs), ctx.globalOptions, ctxx || ctx);
    }
    return {
        get: getWithDefaults,
        post: postWithDefaults,
        postFormData: postFormDataWithDefault
    };
}

function parseAndCheckLogin(ctx, defaultFuncs, retryCount = 0, sourceCall) {
    if (sourceCall === undefined) {
        try {
            throw new Error();
        } catch (e) {
            sourceCall = e;
        }
    }
    return function (data) {
        return tryPromise(function () {
            log.verbose("parseAndCheckLogin", data.body);
            // --- Handle HTTP 5xx with bounded retry (existing logic) ---
            if (data.statusCode >= 500 && data.statusCode < 600) {
                if (retryCount >= 5) {
                    throw {
                        message: "Request retry failed. Check `res` and `statusCode`.",
                        statusCode: data.statusCode,
                        res: data.body,
                        error: "Request retry failed.",
                        sourceCall
                    };
                }
                retryCount++;
                const retryTime = Math.floor(Math.random() * 5000);
                log.warn(
                    "parseAndCheckLogin",
                    `Got status code ${data.statusCode} - Retrying in ${retryTime}ms...`
                );
                if (!data.request) throw new Error("Invalid request object");
                const url = `${data.request.uri.protocol}//${data.request.uri.hostname}${data.request.uri.pathname}`;
                const contentType = data.request.headers?.["content-type"]?.split(";")[0];
                return delay(retryTime)
                    .then(() =>
                        contentType === "multipart/form-data"
                            ? defaultFuncs.postFormData(url, ctx.jar, data.request.formData, {})
                            : defaultFuncs.post(url, ctx.jar, data.request.formData)
                    )
                    .then(parseAndCheckLogin(ctx, defaultFuncs, retryCount, sourceCall));
            }
            // --- New: Explicit 3xx redirect handling (302 login checkpoint, etc.) ---
            if (data.statusCode >= 300 && data.statusCode < 400) {
                const location = data.headers && (data.headers.location || data.headers.Location);
                if (!location) {
                    throw {
                        message: `Redirect (${data.statusCode}) without location header.`,
                        statusCode: data.statusCode,
                        res: data.body,
                        error: "Redirect without location.",
                        sourceCall
                    };
                }
                // Detect checkpoint/login redirects explicitly
                if (/checkpoint|login|recover/i.test(location)) {
                    throw {
                        message: `Redirected to login/checkpoint: ${location}`,
                        statusCode: data.statusCode,
                        location,
                        error: "Not logged in.",
                        type: "login_redirect",
                        res: data.body,
                        sourceCall
                    };
                }
                log.warn("parseAndCheckLogin", `Following redirect -> ${location}`);
                return defaultFuncs.get(location, ctx.jar)
                    .then(parseAndCheckLogin(ctx, defaultFuncs, retryCount, sourceCall));
            }
            if (data.statusCode !== 200) {
                throw {
                    message: `parseAndCheckLogin got status code: ${data.statusCode}.`,
                    statusCode: data.statusCode,
                    res: data.body,
                    error: `parseAndCheckLogin got status code: ${data.statusCode}.`,
                    sourceCall
                };
            }
            let res;
            let bodyText = data.body || "";
            // --- New: Detect full HTML (often login page) before JSON parse ---
            const looksLikeHTML = /<html[\s\S]*<\/html>/i.test(bodyText);
            if (looksLikeHTML && /login|checkpoint|password|m_faceweb|m\.facebook\.com\/login/i.test(bodyText)) {
                throw {
                    message: "Received HTML login/checkpoint page instead of JSON (session likely invalid).",
                    statusCode: data.statusCode,
                    res: bodyText.slice(0, 5000),
                    error: "Not logged in.",
                    type: "html_login_page",
                    sourceCall
                };
            }
            try {
                res = JSON.parse(makeParsable(bodyText));
            } catch (e) {
                // Additional heuristic: if body has FB login form markers
                if (/login_form|checkpointSubmitButton|memorialized/i.test(bodyText)) {
                    throw {
                        message: "Facebook returned login/checkpoint HTML instead of JSON.",
                        detail: e.message,
                        res: bodyText.slice(0, 5000),
                        error: "Not logged in.",
                        type: "html_login_page_parse_fail",
                        sourceCall
                    };
                }
                log.error("JSON parsing failed:", bodyText);
                throw {
                    message: "Failed to parse JSON response.",
                    detail: e.message,
                    res: bodyText.slice(0, 5000),
                    error: "JSON.parse error.",
                    sourceCall
                };
            }
            if (res.redirect && data.request.method === "GET") {
                // New: classify redirect target
                if (/checkpoint|login/i.test(res.redirect)) {
                    throw {
                        message: `Redirected to login/checkpoint (JSON redirect): ${res.redirect}`,
                        statusCode: data.statusCode,
                        location: res.redirect,
                        error: "Not logged in.",
                        type: "login_redirect",
                        res,
                        sourceCall
                    };
                }
                return defaultFuncs
                    .get(res.redirect, ctx.jar)
                    .then(parseAndCheckLogin(ctx, defaultFuncs, undefined, sourceCall));
            }
            // --- Existing cookie & token handling logic (unchanged) ---
            if (
                res.jsmods?.require &&
                Array.isArray(res.jsmods.require[0]) &&
                res.jsmods.require[0][0] === "Cookie"
            ) {
                res.jsmods.require[0][3][0] = res.jsmods.require[0][3][0].replace("_js_", "");
                const cookie = formatCookie(res.jsmods.require[0][3], "facebook");
                const cookie2 = formatCookie(res.jsmods.require[0][3], "messenger");
                ctx.jar.setCookie(cookie, "https://www.facebook.com");
                ctx.jar.setCookie(cookie2, "https://www.messenger.com");
            }
            if (res.jsmods?.require) {
                for (const arr of res.jsmods.require) {
                    if (arr[0] === "DTSG" && arr[1] === "setToken") {
                        ctx.fb_dtsg = arr[3][0];
                        ctx.ttstamp = "2" + ctx.fb_dtsg.split("").map(c => c.charCodeAt(0)).join("");
                    }
                }
            }
            // --- New: Detect common not-logged-in payload patterns ---
            if (res.error === 1357001 || res.error === 1357004 || res.errorSummary === "login required") {
                // 1357001 existing logic below triggers auto_login; keep classification
                if (!ctx.auto_login) {
                    ctx.auto_login = true;
                    auto_login(success => {
                        if (success) {
                            log.info("Auto login successful! Retrying...");
                            ctx.auto_login = false;
                            process.exit(1);
                        } else {
                            ctx.auto_login = false;
                            throw {
                                message: "Facebook blocked login. Please check your account.",
                                error: "Not logged in.",
                                res,
                                statusCode: data.statusCode,
                                sourceCall
                            };
                        }
                    });
                }
            }
            return res;
        });
    };
}
function saveCookies(jar) {
    return function (res) {
        var cookies = res.headers["set-cookie"] || [];
        cookies.forEach(function (c) {
            if (c.indexOf(".facebook.com") > -1) {
                jar.setCookie(c, "https://www.facebook.com");
                jar.setCookie(c.replace(/domain=\.facebook\.com/, "domain=.messenger.com"), "https://www.messenger.com");
            }
        });
        return res;
    };
}

var NUM_TO_MONTH = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
];
var NUM_TO_DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDate(date) {
    var d = date.getUTCDate();
    d = d >= 10 ? d : "0" + d;
    var h = date.getUTCHours();
    h = h >= 10 ? h : "0" + h;
    var m = date.getUTCMinutes();
    m = m >= 10 ? m : "0" + m;
    var s = date.getUTCSeconds();
    s = s >= 10 ? s : "0" + s;
    return (NUM_TO_DAY[date.getUTCDay()] + ", " + d + " " + NUM_TO_MONTH[date.getUTCMonth()] + " " + date.getUTCFullYear() + " " + h + ":" + m + ":" + s + " GMT");
}

function formatCookie(arr, url) {
    return arr[0] + "=" + arr[1] + "; Path=" + arr[3] + "; Domain=" + url + ".com";
}

function formatThread(data) {
    return {
        threadID: formatID(data.thread_fbid.toString()),
        participants: data.participants.map(formatID),
        participantIDs: data.participants.map(formatID),
        name: data.name,
        nicknames: data.custom_nickname,
        snippet: data.snippet,
        snippetAttachments: data.snippet_attachments,
        snippetSender: formatID((data.snippet_sender || "").toString()),
        unreadCount: data.unread_count,
        messageCount: data.message_count,
        imageSrc: data.image_src,
        timestamp: data.timestamp,
        muteUntil: data.mute_until,
        isCanonicalUser: data.is_canonical_user,
        isCanonical: data.is_canonical,
        isSubscribed: data.is_subscribed,
        folder: data.folder,
        isArchived: data.is_archived,
        recipientsLoadable: data.recipients_loadable,
        hasEmailParticipant: data.has_email_participant,
        readOnly: data.read_only,
        canReply: data.can_reply,
        cannotReplyReason: data.cannot_reply_reason,
        lastMessageTimestamp: data.last_message_timestamp,
        lastReadTimestamp: data.last_read_timestamp,
        lastMessageType: data.last_message_type,
        emoji: data.custom_like_icon,
        color: data.custom_color,
        adminIDs: data.admin_ids,
        threadType: data.thread_type
    };
}

function getType(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
}

function formatProxyPresence(presence, userID) {
    if (presence.lat === undefined || presence.p === undefined) return null;
    return {
        type: "presence",
        timestamp: presence.lat * 1000,
        userID: userID || '',
        statuses: presence.p
    };
}

function formatPresence(presence, userID) {
    return {
        type: "presence",
        timestamp: presence.la * 1000,
        userID: userID || '',
        statuses: presence.a
    };
}

function decodeClientPayload(payload) {
    function Utf8ArrayToStr(array) {
        var out, i, len, c;
        var char2, char3;
        out = "";
        len = array.length;
        i = 0;
        while (i < len) {
            c = array[i++];
            switch (c >> 4) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    out += String.fromCharCode(c);
                    break;
                case 12:
                case 13:
                    char2 = array[i++];
                    out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                    break;
                case 14:
                    char2 = array[i++];
                    char3 = array[i++];
                    out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
                    break;
            }
        }
        return out;
    }
    return JSON.parse(Utf8ArrayToStr(payload));
}

function getAppState(jar) {
    return jar.getCookies("https://www.facebook.com").concat(jar.getCookies("https://facebook.com")).concat(jar.getCookies("https://www.messenger.com"));
}

function getData_Path(Obj, Arr, Stt) {
    if (Arr.length === 0 && Obj != undefined) {
        return Obj;
    }
    else if (Obj == undefined) {
        return Stt;
    }
    const head = Arr[0];
    if (head == undefined) {
        return Stt;
    }
    const tail = Arr.slice(1);
    return getData_Path(Obj[head], tail, Stt++);
}

function setData_Path(obj, path, value) {
    if (!path.length) {
        return obj;
    }
    const currentKey = path[0];
    let currentObj = obj[currentKey];

    if (!currentObj) {
        obj[currentKey] = value;
        currentObj = obj[currentKey];
    }
    path.shift();
    if (!path.length) {
        currentObj = value;
    } else {
        currentObj = setData_Path(currentObj, path, value);
    }

    return obj;
}

function getPaths(obj, parentPath = []) {
    let paths = [];
    for (let prop in obj) {
        if (typeof obj[prop] === "object") {
            paths = paths.concat(getPaths(obj[prop], [...parentPath, prop]));
        } else {
            paths.push([...parentPath, prop]);
        }
    }
    return paths;
}

function cleanHTML(text) {
    text = text.replace(/(<br>)|(<\/?i>)|(<\/?em>)|(<\/?b>)|(!?~)|(&amp;)|(&#039;)|(&lt;)|(&gt;)|(&quot;)/g, (match) => {
        switch (match) {
            case "<br>":
                return "\n";
            case "<i>":
            case "<em>":
            case "</i>":
            case "</em>":
                return "*";
            case "<b>":
            case "</b>":
                return "**";
            case "~!":
            case "!~":
                return "||";
            case "&amp;":
                return "&";
            case "&#039;":
                return "'";
            case "&lt;":
                return "<";
            case "&gt;":
                return ">";
            case "&quot;":
                return '"';
        }
    });
    return text;
}

function checkLiveCookie(ctx, defaultFuncs) {
    return defaultFuncs.get("https://m.facebook.com/me", ctx.jar).then(function (res) {
        if (res.body.indexOf(ctx.userID) === -1) {
            throw new CustomError({
                message: "Not logged in.",
                error: "Not logged in."
            });
        }
        return true;
    });
}

function getAccessFromBusiness(jar, Options) {
    return function (res) {
        var html = res ? res.body : null;
        return get('https://business.facebook.com/content_management', jar, null, Options, null, { noRef: true })
            .then(function (res) {
                var token = /"accessToken":"([^.]+)","clientID":/g.exec(res.body)[1];
                return [html, token];
            })
            .catch(function () {
                return [html, null];
            });
    }
}

// --- @anbuinfosec/fca-unofficial Advanced Safety Utilities ---

/**
 * Advanced Safety System for Ultra-Low Ban Rate
 * Intelligent request management to minimize Facebook account risks
 */
const smartSafetyLimiter = {
  userSessions: {},
  
  // Human-like delay patterns to avoid detection
  humanDelays: {
    typing: { min: 800, max: 2000 },
    reading: { min: 1000, max: 3000 },
    thinking: { min: 2000, max: 5000 },
    browsing: { min: 500, max: 1500 }
  },
  
  // Risk level assessment
  assessRisk(userID, action) {
    if (!this.userSessions[userID]) {
      this.userSessions[userID] = {
        requestCount: 0,
        errorCount: 0,
        lastActivity: Date.now(),
        riskLevel: 'low'
      };
    }
    
    const session = this.userSessions[userID];
    const timeSinceLastActivity = Date.now() - session.lastActivity;
    const errorRate = session.errorCount / Math.max(1, session.requestCount);
    
    // Update risk level based on activity patterns
    if (errorRate > 0.3 || timeSinceLastActivity < 1000) {
      session.riskLevel = 'high';
    } else if (errorRate > 0.1 || timeSinceLastActivity < 3000) {
      session.riskLevel = 'medium';
    } else {
      session.riskLevel = 'low';
    }
    
    return session.riskLevel;
  },
  
  // Get safe delay based on risk level and action type
  getSafeDelay(userID, action = 'browsing') {
    const riskLevel = this.assessRisk(userID, action);
    const baseDelay = this.humanDelays[action] || this.humanDelays.browsing;
    
    // Risk multipliers for safety
    const riskMultipliers = {
      'low': 1,
      'medium': 1.5,
      'high': 2.5
    };
    
    const multiplier = riskMultipliers[riskLevel] || 1;
    const min = baseDelay.min * multiplier;
    const max = baseDelay.max * multiplier;
    
    // Generate human-like random delay
    const baseDelayTime = Math.random() * (max - min) + min;
    const humanVariation = baseDelayTime * 0.1 * (Math.random() - 0.5);
    
    return Math.max(200, Math.floor(baseDelayTime + humanVariation));
  },
  
  // Record activity for safety metrics
  recordActivity(userID, isError = false) {
    if (!this.userSessions[userID]) {
      this.userSessions[userID] = {
        requestCount: 0,
        errorCount: 0,
        lastActivity: Date.now(),
        riskLevel: 'low'
      };
    }
    
    const session = this.userSessions[userID];
    session.requestCount++;
    session.lastActivity = Date.now();
    
    if (isError) {
      session.errorCount++;
    }
    
    // Auto-reset metrics every hour to prevent false risk escalation
    if (session.requestCount > 100) {
      session.requestCount = Math.floor(session.requestCount / 2);
      session.errorCount = Math.floor(session.errorCount / 2);
    }
  },
  
  // Check if action is safe to proceed
  isSafeToExecute(userID, action) {
    const riskLevel = this.assessRisk(userID, action);
    
    // Always allow low risk actions
    if (riskLevel === 'low') return true;
    
    // For higher risk, check recent activity
    const session = this.userSessions[userID];
    const timeSinceLastActivity = Date.now() - session.lastActivity;
    
    // Medium risk: ensure some delay between actions
    if (riskLevel === 'medium' && timeSinceLastActivity < 3000) {
      return false;
    }
    
    // High risk: require longer delays
    if (riskLevel === 'high' && timeSinceLastActivity < 10000) {
      return false;
    }
    
    return true;
  }
};

/**
 * Facebook Safety Mode: Enhanced protection against bans
 * Set process.env.FCA_FCA_ULTRA_SAFE_MODE = '1' to enable maximum protection
 */
const ultraSafeMode = process.env.FCA_FCA_ULTRA_SAFE_MODE === '1';
const safeMode = process.env.FCA_FCA_SAFE_MODE === '1' || ultraSafeMode;

/**
 * Account protection lists for enhanced safety
 */
const allowList = process.env.FCA_FCA_ALLOW_LIST ? process.env.FCA_FCA_ALLOW_LIST.split(',') : null;
const blockList = process.env.FCA_FCA_BLOCK_LIST ? process.env.FCA_FCA_BLOCK_LIST.split(',') : null;

function isUserAllowed(userID) {
  if (blockList && blockList.includes(userID)) return false;
  if (allowList && !allowList.includes(userID)) return false;
  return true;
}

// Legacy rate limiter - kept for backward compatibility but optimized for safety
const rateLimiter = {
  limits: {},
  windowMs: 60 * 1000,
  max: 20,
  check(userID, action) {
    // Use smart safety limiter instead of blocking
    return smartSafetyLimiter.isSafeToExecute(userID, action);
  }
};

// Add robust session validation utility used by listenMqtt
async function validateSession(ctx, defaultFuncs, opts = {}) {
    const { retries = 0, delayMs = 750 } = opts || {};
    if (!ctx || !ctx.jar) {
        throw new CustomError({ message: 'No context/jar provided', type: 'not_logged_in' });
    }
    const cookies = ctx.jar.getCookies('https://www.facebook.com');
    const hasUser = cookies.some(c => (c.key || c.name) === 'c_user');
    if (!hasUser) {
        throw new CustomError({ message: 'Not logged in (missing c_user cookie)', type: 'not_logged_in' });
    }

    const endpoints = [
        'https://www.facebook.com/ajax/mercury/threadlist_info.php?client=mercury',
        'https://m.facebook.com/me'
    ];

    function isHtmlLoginPage(body) {
        if (!body || typeof body !== 'string') return false;
        if (body.length < 40) return false;
        const lowered = body.toLowerCase();
        return (
            (lowered.includes('login') && lowered.includes('password')) ||
            lowered.includes('m_login_email') ||
            lowered.includes('/login/device-based')
        );
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
        let allPassed = true;
        for (const url of endpoints) {
            try {
                // Prefer provided defaultFuncs.get if available (applies defaults & fb_dtsg)
                const res = defaultFuncs && defaultFuncs.get
                    ? await defaultFuncs.get(url, ctx.jar, {})
                    : await get(url, ctx.jar, null, ctx.globalOptions, ctx);

                const status = res && res.statusCode;
                const body = res && res.body ? res.body.toString() : '';

                if (status >= 300 && status < 400) {
                    throw new CustomError({ message: 'Login redirect detected', type: 'login_redirect', statusCode: status });
                }
                if (status === 0 || status === undefined) {
                    throw new CustomError({ message: 'No status code (network?)', type: 'network_error' });
                }
                if (status === 401 || status === 403) {
                    throw new CustomError({ message: 'Unauthorized / forbidden', type: 'not_logged_in', statusCode: status });
                }
                if (isHtmlLoginPage(body)) {
                    throw new CustomError({ message: 'HTML login page served', type: 'html_login_page' });
                }
                // Basic heuristic: body containing checkpoint indicators
                if (/checkpoint|review recent login/i.test(body)) {
                    throw new CustomError({ message: 'Checkpoint required', type: 'checkpoint' });
                }
            } catch (err) {
                allPassed = false;
                if (attempt >= retries) {
                    // Re-throw final classified error (ensure type present)
                    if (err instanceof CustomError) throw err;
                    throw new CustomError({ message: err.message || 'Session invalid', type: err.type || 'not_logged_in', original: err });
                }
                break; // break inner loop to retry endpoints
            }
        }
        if (allPassed) return true;
        if (attempt < retries) await delay(delayMs);
    }
    // Fallback (should not reach)
    throw new CustomError({ message: 'Unknown session validation failure', type: 'not_logged_in' });
}

// Preserve earlier named exports while adding validateSession
module.exports = {
    CustomError,
    cleanHTML,
    isReadableStream: isReadableStream,
    get: get,
    get2: get2,
    post: post,
    postFormData: postFormData,
    generateThreadingID: generateThreadingID,
    generateOfflineThreadingID: generateOfflineThreadingID,
    getGUID: getGUID,
    getFrom: getFrom,
    makeParsable: makeParsable,
    arrToForm: arrToForm,
    getSignatureID: getSignatureID,
    getJar: request.jar,
    generateTimestampRelative: generateTimestampRelative,
    makeDefaults: makeDefaults,
    parseAndCheckLogin: parseAndCheckLogin,
    getData_Path,
    setData_Path,
    getPaths,
    saveCookies,
    getType,
    _formatAttachment,
    formatHistoryMessage,
    formatID,
    formatMessage,
    formatDeltaEvent,
    formatDeltaMessage,
    formatProxyPresence,
    formatPresence,
    formatTyp,
    formatDeltaReadReceipt,
    formatCookie,
    formatThread,
    formatReadReceipt,
    formatRead,
    generatePresence,
    generateAccessiblityCookie,
    formatDate,
    decodeClientPayload,
    getAppState,
    getAdminTextMessageType,
    setProxy,
    checkLiveCookie,
    getAccessFromBusiness,
    getFroms,
    validateSession,
    // Safety & rate limiting exports
    rateLimiter,
    smartSafetyLimiter,
    safeMode,
    ultraSafeMode,
    isUserAllowed
};