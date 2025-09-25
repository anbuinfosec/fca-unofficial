# Unofficial Facebook Chat API

<a href="https://www.npmjs.com/package/@anbuinfosec/fca-unofficial"><img alt="npm version" src="https://img.shields.io/npm/v/@anbuinfosec/fca-unofficial.svg?style=flat-square"></a>
<a href="https://www.npmjs.com/package/@anbuinfosec/fca-unofficial"><img src="https://img.shields.io/npm/dm/@anbuinfosec/fca-unofficial.svg?style=flat-square" alt="npm downloads"></a>

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## 📦 Install & Usage (Fork)

This is a maintained fork of the original `@anbuinfosec/fca-unofficial` Messenger API, adapted for my **Chika Shirogane** bot and compatible with **GoatBot-V2** (with modified source).

### Install directly from GitHub
```bash
npm install @anbuinfosec/fca-unofficial
```

Or add to your `package.json`:
```json
"dependencies": {
    "@anbuinfosec/fca-unofficial": "^1.4.0"
}
```

### Usage
Import and use as you would the main module:
```js
const login = require('@anbuinfosec/fca-unofficial');
(async () => {
  const api = await login({ appState: require('./appstate.json') });
  // ...
})();
```

### About this fork
- Based on the main [@anbuinfosec/fca-unofficial](https://github.com/anbuinfosec/fca-unofficial) source
- Adapted for Chika Shirogane bot and GoatBot-V2 integration
- Includes enhancements, async/await support, and compatibility fixes

---
---

# @anbuinfosec/fca-unofficial v3.0.0 – Advanced Core Release

Modern, safe, production‑ready Messenger (Facebook Chat) API layer with integrated secure login (credentials + 2FA), adaptive session & connection resilience, delivery reliability safeguards, memory protection, and rich runtime metrics. Promise + callback compatible, TypeScript typed, minimal friction.

---
## ✅ Core Value
| Pillar | What You Get |
|--------|--------------|
| Integrated Secure Login | Username / Password / TOTP 2FA → stable appstate generation & reuse |
| Session Resilience | Anchored User‑Agent continuity, adaptive safe refresh, lightweight token poke, periodic recycle |
| Connection Stability | Adaptive MQTT backoff, idle & ghost detection, layered post-refresh health probes, synthetic keepalives |
| Delivery Reliability | Multi-path message send fallback (MQTT → HTTP → direct) + delivery receipt timeout suppression |
| Memory Guard | Bounded queues, edit TTL sweeps, controlled resend limits |
| Observability | Health + memory + delivery metrics (`api.getHealthMetrics()`, `api.getMemoryMetrics()`) |
| Edit Safety | Pending edit buffer, ACK watchdog, p95 ACK latency tracking |
| Type Definitions | First-class `index.d.ts` with modern Promise signatures |

---
## 🔄 What Changed in 3.0.0
Major version signals maturity & consolidation. No breaking public API changes versus late 2.1.x – upgrade is drop‑in. Temporary diagnostic harness removed; internal instrumentation formalized. Delivery receipt timeouts now intelligently retried & optionally auto-suppressed to protect outbound responsiveness.

---
## 🚀 Quick Start (Appstate Preferred)
```js
const login = require('@anbuinfosec/fca-unofficial');

(async () => {
  const api = await login({ appState: require('./appstate.json') });
  console.log('Logged in as', api.getCurrentUserID());
  api.listen((err, evt) => {
    if (err) return console.error('Listen error:', err);
    if (evt.body) api.sendMessage('Echo: ' + evt.body, evt.threadID);
  });
})();
```

### Credentials + 2FA Flow
```js
const login = require('@anbuinfosec/fca-unofficial');
(async () => {
  const api = await login({
    email: process.env.FB_EMAIL,
    password: process.env.FB_PASS,
    twofactor: process.env.FB_2FA_SECRET // optional TOTP secret
  });
  api.listen((err, msg) => {
    if (err) return console.error(err);
    if (msg.body === 'ping') api.sendMessage('pong', msg.threadID);
  });
})();
```

---
## 🧪 Key Runtime APIs
```js
api.setEditOptions({ maxPendingEdits, editTTLms, ackTimeoutMs, maxResendAttempts });
api.setBackoffOptions({ base, factor, max, jitter });
api.enableLazyPreflight(true);       // Skip heavy validation if recent success
api.getHealthMetrics();              // uptime, reconnects, ack latency, delivery stats
api.getMemoryMetrics();              // queue sizes & guard counters
```

### Monitoring Snippet
```js
setInterval(() => {
  const h = api.getHealthMetrics();
  const m = api.getMemoryMetrics();
  console.log('[HEALTH]', h?.status, 'acks', h?.ackCount, 'p95Ack', h?.p95AckLatencyMs);
  console.log('[DELIVERY]', {
    attempts: h?.deliveryAttempts,
    success: h?.deliverySuccess,
    failed: h?.deliveryFailed,
    timeouts: h?.deliveryTimeouts,
    disabledSince: h?.deliveryDisabledSince
  });
  console.log('[MEM]', m);
}, 60000);
```

---
## 🛡️ Safety & Stability Architecture
| Layer | Mechanism | Purpose |
|-------|-----------|---------|
| UA Continuity | Single anchored fingerprint | Avoid heuristic expiry & drift |
| Adaptive Refresh | Risk-aware timing bands | Token longevity without bursts |
| Lightweight Poke | Subtle `fb_dtsg` renewal | Keeps session warm quietly |
| Collision Guard | 45m spacing window | Prevent clustered maintenance events |
| Idle / Ghost Probe | Timed silent detection | Force reconnect on stale sockets |
| Periodic Recycle | Randomized (~6h ±30m) | Pre-empt silent degradation |
| Backoff Strategy | Exponential + jitter | Graceful network recovery |
| Delivery Suppression | Disable after repeated timeouts | Preserve send latency |

Disable heavy preflight if embedding inside a framework already doing checks:
```js
await login({ appState }, { disablePreflight: true });
```

---
## 🛰️ MQTT Enhancements (Since 2.1.x)
- Adaptive reconnect curve (caps 5m)
- Layered post-refresh probes (1s / 10s / 30s)
- Synthetic randomized keepalives (55–75s)
- Structured error classification feeding metrics

---
## ✉️ Delivery Reliability
- Multi-path send fallback (MQTT publish → HTTP send → direct fallback)
- Per-attempt timeout & retry for message delivery receipts
- Automatic classification of transient timeouts (ETIMEDOUT / ECONNRESET / EAI_AGAIN)
- Adaptive suppression of delivery receipt calls when environment unstable (protects primary send throughput)

---
## 🧠 Long Session Best Practices
1. Prefer appstate reuse (minimal credential logins).
2. Preserve `persistent-device.json` (only delete if forced challenge).
3. Don’t manually rotate User-Agent – built-in continuity handles it.
4. Inspect metrics before forcing reconnect; let backoff work.
5. Keep dependencies updated; review CHANGELOG for operational notes.

---
## 🐐 Using with GoatBot V2 (Summary)
| Goal | Steps |
|------|-------|
| Generate appstate | Run credential login script → save `appstate.json` → configure GoatBot |
| Full replacement | Install `@anbuinfosec/fca-unofficial` → shim `fb-chat-api/index.js` exporting module |
| Direct require swap | Replace `require('fb-chat-api')` with `require('@anbuinfosec/fca-unofficial')` |

Minimal example:
```js
const login = require('@anbuinfosec/fca-unofficial');
(async () => {
  const api = await login({ appState: require('./appstate.json') });
  api.listen((err, event) => {
    if (err) return console.error(err);
    if (event.body === '!ping') api.sendMessage('pong', event.threadID);
  });
})();
```

---
## 📚 Documentation Map
| Resource | Location |
|----------|----------|
| Full API Reference | `DOCS.md` |
| Feature Guides | `docs/*.md` |
| Configuration Reference | `docs/configuration-reference.md` |
| Safety Details | `docs/account-safety.md` |
| Examples | `examples/` |

---
## � Migrating 2.1.x → 3.0.0
| Area | Action Needed |
|------|---------------|
| Public API | None (fully compatible) |
| Diagnostics Harness | Removed (no action) |
| Delivery Metrics | Optionally surface in dashboards |
| Safety Manager (legacy) | Keep removed / unused |

---
## 🗂 Previous 2.1.x Highlights (Condensed)
| Version | Focus | Key Additions |
|---------|-------|---------------|
| 2.1.10 | Stabilization | Final 2.1.x meta adjustments |
| 2.1.8 | Safety Consolidation | Unified orchestrator, collision spacing, recycle suppression |
| 2.1.7 | Session Longevity | UA continuity, lightweight poke |
| 2.1.6 | Memory Guard | Queue pruning, edit TTL sweeps |
| 2.1.5 | Edit Reliability | PendingEdits buffer, ACK watchdog |

Full details remain in `CHANGELOG.md`.

---
## ⚠️ Disclaimer
Not affiliated with Facebook. Use responsibly and comply with platform terms & local laws.

---
## 🤝 Contributing
Focused PRs improving stability, safety heuristics, protocol coverage, or typings are welcome.

---

# 📋 API Methods Quick Reference & Code Examples

## Login Methods
| Method | Description | Example |
|--------|-------------|---------|
| `fcaLogin()` | Advanced login with ID/pass/2FA | `await fcaLogin({username, password, twofactor})` |
| `login()` | Traditional login | `login({email, password}, callback)` |

```js
// Login with appstate
const login = require('@anbuinfosec/fca-unofficial');
(async () => {
  const api = await login({ appState: require('./appstate.json') });
  api.listen((err, evt) => {
    if (err) return console.error(err);
    if (evt.body) api.sendMessage('Echo: ' + evt.body, evt.threadID);
  });
})();
```

## Message Methods
| Method | Description | Example |
|--------|-------------|---------|
| `sendMessage()` | Send text/media message | `api.sendMessage('Hello!', threadID)` |
| `sendMessageMqtt()` | Send message via MQTT (faster) | `api.sendMessageMqtt('Hello!', threadID)` |
| `editMessage()` | Edit existing message | `api.editMessage('New text', messageID)` |
| `unsendMessage()` | Delete/unsend message | `api.unsendMessage(messageID)` |
| `markAsRead()` | Mark messages as read | `api.markAsRead(threadID)` |
| `markAsDelivered()` | Mark as delivered | `api.markAsDelivered(threadID)` |
| `markAsReadAll()` | Mark all threads as read | `api.markAsReadAll()` |
| `markAsSeen()` | Mark as seen | `api.markAsSeen()` |
| `setMessageReaction()` | React to message | `api.setMessageReaction('😍', messageID)` |
| `setMessageReactionMqtt()` | React via MQTT | `api.setMessageReactionMqtt('👍', messageID)` |
| `pinMessage()` | Pin message in chat | `api.pinMessage(messageID)` |

```js
// Send a message
api.sendMessage('Hello World!', threadID);

// Send with attachment
const fs = require('fs');
api.sendMessage({
  body: 'Check this image!',
  attachment: fs.createReadStream('./image.jpg')
}, threadID);
```

## Thread/Chat Methods
| Method | Description | Example |
|--------|-------------|---------|
| `getThreadList()` | Get list of chats | `api.getThreadList(20, null, [], callback)` |
| `getThreadInfo()` | Get chat information | `api.getThreadInfo(threadID, callback)` |
| `getThreadHistory()` | Get message history | `api.getThreadHistory(threadID, 50, null, callback)` |
| `getThreadPictures()` | Get shared pictures | `api.getThreadPictures(threadID, 0, 10, callback)` |
| `searchForThread()` | Search for chats | `api.searchForThread('name', callback)` |
| `setTitle()` | Change chat name | `api.setTitle('New Name', threadID)` |
| `changeThreadColor()` | Change chat color | `api.changeThreadColor('#ff0000', threadID)` |
| `changeThreadEmoji()` | Change chat emoji | `api.changeThreadEmoji('🎉', threadID)` |
| `changeArchivedStatus()` | Archive/unarchive chat | `api.changeArchivedStatus(threadID, true)` |
| `muteThread()` | Mute/unmute chat | `api.muteThread(threadID, 3600)` |
| `deleteThread()` | Delete chat | `api.deleteThread(threadID)` |

```js
// Get thread list
api.getThreadList(20, null, [], (err, list) => {
  if (err) return console.error(err);
  list.forEach(thread => {
    console.log(`${thread.name}: ${thread.threadID}`);
  });
});
```

## Group Management
| Method | Description | Example |
|--------|-------------|---------|
| `createNewGroup()` | Create new group | `api.createNewGroup([userID1, userID2], 'Name', callback)` |
| `addUserToGroup()` | Add user to group | `api.addUserToGroup(userID, threadID)` |
| `removeUserFromGroup()` | Remove user from group | `api.removeUserFromGroup(userID, threadID)` |
| `changeAdminStatus()` | Make/remove admin | `api.changeAdminStatus(threadID, userID, true)` |
| `changeGroupImage()` | Change group picture | `api.changeGroupImage(stream, threadID)` |

## User Methods
| Method | Description | Example |
|--------|-------------|---------|
| `getUserInfo()` | Get user information | `api.getUserInfo(userID, callback)` |
| `getCurrentUserID()` | Get bot's user ID | `const myID = api.getCurrentUserID()` |
| `getUserID()` | Get user ID by username | `api.getUserID('username', callback)` |
| `getAvatarUser()` | Get user avatar URL | `api.getAvatarUser(userID, callback)` |
| `changeUsername()` | Change username | `api.changeUsername('new_username')` |
| `changeBio()` | Change bio | `api.changeBio('New bio')` |
| `changeAvatar()` | Change profile picture | `api.changeAvatar(stream)` |
| `changeAvatarV2()` | Change avatar (enhanced) | `api.changeAvatarV2(stream)` |
| `changeCover()` | Change cover photo | `api.changeCover(stream)` |
| `changeName()` | Change display name | `api.changeName('New Name')` |
| `changeNickname()` | Change nickname in chat | `api.changeNickname('Nick', threadID, userID)` |
| `setProfileGuard()` | Enable/disable profile guard | `api.setProfileGuard(true)` |

## Friends & Social
| Method | Description | Example |
|--------|-------------|---------|
| `getFriendsList()` | Get friends list | `api.getFriendsList(callback)` |
| `handleFriendRequest()` | Accept/decline friend request | `api.handleFriendRequest(userID, true)` |
| `follow()` | Send friend request/follow | `api.follow(userID)` |
| `unfriend()` | Remove friend | `api.unfriend(userID)` |
| `handleMessageRequest()` | Accept/decline message request | `api.handleMessageRequest(threadID, true)` |
| `changeBlockedStatus()` | Block/unblock user | `api.changeBlockedStatus(userID, true)` |
| `changeBlockedStatusMqtt()` | Block/unblock via MQTT | `api.changeBlockedStatusMqtt(userID, true)` |

## Posts & Social Media
| Method | Description | Example |
|--------|-------------|---------|
| `createPost()` | Create Facebook post | `api.createPost('Hello Facebook!', callback)` |
| `createPoll()` | Create poll in group | `api.createPoll('Question?', ['A', 'B'], threadID)` |
| `setPostReaction()` | React to post | `api.setPostReaction(postID, 'LOVE')` |
| `setStoryReaction()` | React to story | `api.setStoryReaction(storyID, 'LOVE')` |
| `sendComment()` | Comment on post | `api.sendComment('Great!', postID)` |
| `createCommentPost()` | Create comment post | `api.createCommentPost('Comment', postID)` |

## File & Media Methods
| Method | Description | Example |
|--------|-------------|---------|
| `uploadAttachment()` | Upload file | `api.uploadAttachment(stream, callback)` |
| `forwardAttachment()` | Forward attachment | `api.forwardAttachment(attachmentID, threadID)` |
| `shareContact()` | Share contact | `api.shareContact('Message', userID, threadID)` |
| `shareLink()` | Share link | `api.shareLink('https://example.com', threadID)` |
| `resolvePhotoUrl()` | Get photo URL | `api.resolvePhotoUrl(photoID, callback)` |

## Search Methods
| Method | Description | Example |
|--------|-------------|---------|
| `searchStickers()` | Search stickers | `api.searchStickers('happy', callback)` |
| `getEmojiUrl()` | Get emoji image URL | `api.getEmojiUrl('😍', 'large', callback)` |

## HTTP Methods
| Method | Description | Example |
|--------|-------------|---------|
| `httpGet()` | HTTP GET request | `api.httpGet(url, {}, {}, callback)` |
| `httpPost()` | HTTP POST request | `api.httpPost(url, data, {}, callback)` |
| `httpPostFormData()` | POST form data | `api.httpPostFormData(url, formData, {}, callback)` |

## Advanced Features
| Method | Description | Example |
|--------|-------------|---------|
| `listenMqtt()` | Listen via MQTT | `api.listenMqtt(callback)` |
| `stopListenMqtt()` | Stop MQTT listening | `api.stopListenMqtt()` |
| `listenNotification()` | Listen to notifications | `api.listenNotification(callback)` |
| `sendTypingIndicator()` | Show typing indicator | `api.sendTypingIndicator(threadID)` |
| `listen()` | Listen to all events | `api.listen(callback)` |

## Configuration
| Method | Description | Example |
|--------|-------------|---------|
| `setOptions()` | Set API options | `api.setOptions({listenEvents: true})` |
| `getOptions()` | Get current options | `const opts = api.getOptions()` |
| `getCtx()` | Get bot context | `const ctx = api.getCtx()` |
| `getAccess()` | Get access info | `const access = api.getAccess()` |
| `getBotInitialData()` | Get initial data | `const data = api.getBotInitialData()` |
| `getRegion()` | Get current region | `api.getRegion(callback)` |
| `refreshFb_dtsg()` | Refresh security token | `api.refreshFb_dtsg(callback)` |

## Security & Session
| Method | Description | Example |
|--------|-------------|---------|
| `logout()` | Logout properly | `api.logout(callback)` |
| `getAppState()` | Get session appstate | `const appstate = api.getAppState()` |

## UI Customization
| Method | Description | Example |
|--------|-------------|---------|
| `threadColors()` | Get available colors | `api.threadColors(callback)` |

---

For more code examples and advanced usage, see `COMPLETE-API-DOCS.md` and `DOCS.md`.
