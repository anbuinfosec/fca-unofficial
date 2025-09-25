// @anbuinfosec/fca-unofficial: Advanced TypeScript Definitions
// Enhanced with modern types and better error handling

declare module '@anbuinfosec/fca-unofficial' {
    import type { Readable, Duplex, Transform, EventEmitter } from "stream";
    import type { EventEmitter as NodeEventEmitter } from "events";

    type ReadableStream = Readable | Duplex | Transform;
    
    // Enhanced Client Options
    interface FcaClientOptions {
        prefix?: string;
        selfListen?: boolean;
        listenEvents?: boolean;
        updatePresence?: boolean;
        autoMarkDelivery?: boolean;
        autoMarkRead?: boolean;
        safeMode?: boolean;
        // rateLimitEnabled REMOVED for maximum Facebook account safety
        mqttReconnectInterval?: number;
        logLevel?: 'silent' | 'error' | 'warn' | 'info' | 'verbose';
        performanceOptimization?: boolean;
        cachingEnabled?: boolean;
        databasePath?: string;
        retryAttempts?: number;
        circuitBreakerThreshold?: number;
        heartbeatInterval?: number;
        middlewareEnabled?: boolean;
        maxSafetyMode?: boolean; // NEW: Maximum safety mode
    }

    // Performance Manager Types
    interface PerformanceMetrics {
        requestCount: number;
        averageResponseTime: number;
        errorRate: number;
        cacheHitRate: number;
        memoryUsage: number;
        activeMqttConnections: number;
    }

    interface CacheOptions {
        ttl?: number;
        maxSize?: number;
        strategy?: 'lru' | 'lfu' | 'fifo';
    }

    // Error Handling Types
    interface fcaError extends Error {
        code?: string;
        statusCode?: number;
        details?: any;
        retryable?: boolean;
        timestamp?: number;
    }

    interface RetryOptions {
        maxAttempts?: number;
        backoffStrategy?: 'linear' | 'exponential';
        baseDelay?: number;
        maxDelay?: number;
    }

    interface CircuitBreakerOptions {
        failureThreshold?: number;
        resetTimeout?: number;
        monitoringPeriod?: number;
    }

    // MQTT Connection Types
    interface MqttConnectionOptions {
        autoReconnect?: boolean;
        reconnectInterval?: number;
        heartbeatInterval?: number;
        maxReconnectAttempts?: number;
        connectionTimeout?: number;
        keepaliveInterval?: number;
    }

    interface MqttConnectionState {
        isConnected: boolean;
        reconnectCount: number;
        lastHeartbeat: number;
        connectionStartTime: number;
        totalDowntime: number;
    }

    // Enhanced Message Structure
    interface FcaMessage {
        id: string;
        content: string;
        body: string;
        author: fcaUser;
        thread: fcaThread;
        attachments: fcaAttachment[];
        mentions: { [id: string]: string };
        timestamp: number;
        isGroup: boolean;
        type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'sticker' | 'gif';
        reactions: fcaReaction[];
        replyTo?: FcaMessage;
        isEdited: boolean;
        editHistory: string[];
        
        // Methods
        reply(content: string | MessageOptions): Promise<FcaMessage>;
        react(emoji: string): Promise<void>;
        edit(newContent: string): Promise<void>;
        unsend(): Promise<void>;
        forward(threadId: string): Promise<void>;
        pin(): Promise<void>;
        unpin(): Promise<void>;
        markAsRead(): Promise<void>;
        getThread(): Promise<fcaThread>;
        getAuthor(): Promise<fcaUser>;
    }

    // Enhanced User Structure
    interface fcaUser {
        id: string;
        name: string;
        firstName?: string;
        lastName?: string;
        username?: string;
        profileUrl?: string;
        avatarUrl?: string;
        isFriend: boolean;
        isBlocked: boolean;
        isOnline: boolean;
        lastActive?: number;
        bio?: string;
        location?: string;
        metadata: Record<string, any>;
        
        // Methods
        sendMessage(content: string | MessageOptions): Promise<FcaMessage>;
        addAsFriend(): Promise<void>;
        block(): Promise<void>;
        unblock(): Promise<void>;
        getSharedThreads(): Promise<fcaThread[]>;
        getProfilePicture(): Promise<string>;
        changeBio(bio: string): Promise<void>;
    }

    // Enhanced Thread Structure
    interface fcaThread {
        id: string;
        name?: string;
        threadType: 'user' | 'group';
        imageUrl?: string;
        emoji?: string;
        color?: string;
        participants: fcaUser[];
        participantCount: number;
        isGroup: boolean;
        isArchived: boolean;
        isPinned: boolean;
        isMuted: boolean;
        lastMessage?: FcaMessage;
        lastMessageTime?: number;
        permissions: ThreadPermissions;
        metadata: Record<string, any>;
        
        // Methods
        sendMessage(content: string | MessageOptions): Promise<FcaMessage>;
        getHistory(limit?: number, before?: number): Promise<FcaMessage[]>;
        addUser(userId: string): Promise<void>;
        removeUser(userId: string): Promise<void>;
        changeImage(imageUrl: string): Promise<void>;
        changeName(name: string): Promise<void>;
        changeColor(color: string): Promise<void>;
        changeEmoji(emoji: string): Promise<void>;
        setTitle(title: string): Promise<void>;
        archive(): Promise<void>;
        unarchive(): Promise<void>;
        pin(): Promise<void>;
        unpin(): Promise<void>;
        mute(): Promise<void>;
        unmute(): Promise<void>;
        markAsRead(): Promise<void>;
        markAsDelivered(): Promise<void>;
        getParticipants(): Promise<fcaUser[]>;
        getAdmins(): Promise<fcaUser[]>;
        makeAdmin(userId: string): Promise<void>;
        removeAdmin(userId: string): Promise<void>;
    }

    // Message Options
    interface MessageOptions {
        body?: string;
        attachment?: ReadableStream | string;
        attachments?: (ReadableStream | string)[];
        url?: string;
        sticker?: string;
        emoji?: string;
        mentions?: { [id: string]: string };
        location?: { latitude: number; longitude: number };
        replyTo?: string;
        isTyping?: boolean;
    }

    // Attachment Types
    interface fcaAttachment {
        id: string;
        type: 'image' | 'video' | 'audio' | 'file' | 'location' | 'contact';
        url: string;
        filename?: string;
        size?: number;
        width?: number;
        height?: number;
        duration?: number;
        thumbnailUrl?: string;
        metadata: Record<string, any>;
    }

    // Reaction Types
    interface fcaReaction {
        emoji: string;
        users: string[];
        count: number;
    }

    // Thread Permissions
    interface ThreadPermissions {
        canSendMessages: boolean;
        canAddUsers: boolean;
        canRemoveUsers: boolean;
        canChangeInfo: boolean;
        canMakeAdmin: boolean;
    }

    // Client Class
    class FcaClient extends NodeEventEmitter {
        constructor(options?: FcaClientOptions);
        
        // Authentication
        login(credentials: { appState: any[] } | { email: string; password: string }): Promise<IFCAU_API>;
        logout(): Promise<void>;
        
        // Command System
        loadCommands(directory: string): void;
        registerCommand(name: string, handler: CommandHandler): void;
        unregisterCommand(name: string): void;
        
        // Middleware System
        use(middleware: Middleware): void;
        
        // Performance Management
        getMetrics(): PerformanceMetrics;
        clearCache(): void;
        optimizePerformance(): void;
        
        // Events
        on(event: 'ready', listener: (api: IFCAU_API, userID: string) => void): this;
        on(event: 'message', listener: (message: FcaMessage) => void): this;
        on(event: 'command', listener: (command: { name: string; args: string[]; message: FcaMessage }) => void): this;
        on(event: 'error', listener: (error: fcaError) => void): this;
        on(event: 'reconnect', listener: () => void): this;
        on(event: 'disconnect', listener: () => void): this;
        on(event: 'userOnline', listener: (user: fcaUser) => void): this;
        on(event: 'userOffline', listener: (user: fcaUser) => void): this;
        on(event: 'threadUpdated', listener: (thread: fcaThread) => void): this;
        on(event: 'messageReaction', listener: (reaction: fcaReaction, message: FcaMessage) => void): this;
        on(event: 'messageEdit', listener: (oldMessage: FcaMessage, newMessage: FcaMessage) => void): this;
        on(event: 'messageUnsend', listener: (message: FcaMessage) => void): this;
        on(event: 'typingStart', listener: (user: fcaUser, thread: fcaThread) => void): this;
        on(event: 'typingStop', listener: (user: fcaUser, thread: fcaThread) => void): this;
    }

    // Command Handler Type
    // Command Handler Type
    type CommandHandler = (args: string[], message: FcaMessage, api: IFCAU_API) => Promise<void> | void;

    // Middleware Type
    type Middleware = (message: FcaMessage, next: () => void) => void;

    // Login function overloads
    function login(credentials: Partial<{
        email: string,
        password: string,
        appState: AppstateData
    }>, options: Partial<IFCAU_Options>, callback: (err: Error | null, api: IFCAU_API) => void): void;
    function login(credentials: Partial<{
        email: string,
        password: string,
        appState: AppstateData
    }>, options: Partial<IFCAU_Options>): Promise<IFCAU_API>;
    function login(credentials: Partial<{
        email: string,
        password: string,
        appState: AppstateData
    }>, callback: (err: Error | null, api: IFCAU_API) => void): void;
    function login(credentials: Partial<{
        email: string,
        password: string,
        appState: AppstateData
    }>): Promise<IFCAU_API>;

    export default login;

    export type Cookie = {
        key: string,
        value: string,
        domain: string,
        path?: string,
        hostOnly?: boolean,
        creation?: string,
        lastAccessed?: string
    }

    export type AppstateData = {
        appState: Cookie[]
    }

    export type MessageObject = {
        body: string,
        sticker?: string,
        attachment?: ReadableStream | ReadableStream[],
        url?: string,
        emoji?: string,
        emojiSize?: string,
        mentions?: {
            tag: string,
            id: string,
            fromIndex?: number
        }[],
        location?: {
            latitude: number,
            longitude: number,
            current?: boolean
        }
    }

    function sendMessage(
        message: string | MessageObject,
        threadID: string | string[],
        callback?: (err?: Error, data?: { threadID: string, messageID: string, timestamp: number }) => void,
        replyMessageID?: string,
        isGroup?: boolean
    ): Promise<{ threadID: string, messageID: string, timestamp: number }>;
    function sendMessage(
        message: string | MessageObject,
        threadID: string | string[],
        replyMessageID?: string,
        isGroup?: boolean
    ): Promise<{ threadID: string, messageID: string, timestamp: number }>;

    export type IFCAU_API = {
        addUserToGroup: (userID: string, threadID: string, callback?: (err?: Error) => void) => Promise<void>,
        changeAdminStatus: (threadID: string, adminIDs: string | string[], adminStatus: boolean, callback?: (err?: Error) => void) => Promise<void>,
		changeApprovalMode: (approvalMode: 0 | 1, threadID: string, callback?: (err?: Error) => void) => Promise<void>,
        changeArchivedStatus: (threadOrThreads: string | string[], archive: boolean, callback?: (err?: Error) => void) => Promise<void>,
        changeBlockedStatus: (userID: string, blocked: boolean, callback?: (err?: Error) => void) => Promise<void>,
        changeBlockedStatusMqtt: (userID: string, status: boolean, type?: string, callback?: (err?: Error) => void) => Promise<void>,
        changeGroupImage: (image: ReadableStream, threadID: string, callback?: (err?: Error) => void) => Promise<void>,
        changeNickname: (nickname: string, threadID: string, pariticipantID: string, callback?: (err?: Error) => void) => Promise<void>,
        changeThreadColor: (color: string, threadID: string, callback?: (err?: Error) => void) => Promise<void>,
        changeThreadEmoji: (emoji: string | null, threadID: string, callback?: (err?: Error) => void) => Promise<void>,
        createNewGroup: (participantIDs: string[], groupTitle?: string, callback?: (err: Error, threadID: string) => void) => Promise<string>,
        createPoll: (title: string, threadID: string, options?: { [item: string]: boolean }, callback?: (err?: Error) => void) => Promise<void>,
        createPollMqtt: (title: string, threadID: string, options?: { [item: string]: boolean }, callback?: (err?: Error) => void) => Promise<void>,
        deleteMessage: (messageOrMessages: string | string[], callback?: (err?: Error) => void) => Promise<void>,
        deleteThread: (threadOrThreads: string | string[], callback?: (err?: Error) => void) => Promise<void>,
        editMessage: (text: string, messageID: string, callback?: (err?: Error) => void) => Promise<void>,
        forwardAttachment: (attachmentID: string, userOrUsers: string | string[], callback?: (err?: Error) => void) => Promise<void>,
        forwardMessage: (messageID: string, threadID: string, callback?: (err?: Error) => void) => Promise<void>,
        getAppState: () => any,
        getCurrentUserID: () => string,
        getEmojiUrl: (c: string, size: number, pixelRatio: number) => string,
        getFriendsList: (callback?: (err: Error | null, friends: IFCAU_Friend[]) => void) => Promise<IFCAU_Friend[]>,
        getThreadHistory: (threadID: string, amount: number, time?: number, callback?: (err: Error | null, messages: any[]) => void) => Promise<any[]>,
        getThreadInfo: (threadID: string, callback?: (err: Error | null, thread: IFCAU_Thread) => void) => Promise<IFCAU_Thread>,
        getThreadList: (limit: number, timestamp: number | null, tags: string[], callback?: (err: Error | null, threads: IFCAU_ThreadList) => void) => Promise<IFCAU_ThreadList>,
        getThreadPictures: (threadID: string, offset: number, limit: number, callback?: (err: Error | null, pictures: string[]) => void) => Promise<string[]>,
        getUserID: (name: string, callback?: (err: Error | null, obj: IFCAU_UserIDResponse) => void) => Promise<IFCAU_UserIDResponse>,
        getUserInfo: (userOrUsers: string | string[], callback?: (err: Error | null, users: { [id: string]: IFCAU_User }) => void) => Promise<{ [id: string]: IFCAU_User }>,
        threadColors: {
            [color: string]: string
        },
        handleMessageRequest(threadOrThreads: string | string[], accept: boolean, callback: (err?: Error) => void): Promise<void>;
        listen(callback?: (err: Error | null, message: IFCAU_ListenMessage) => void): EventEmitter;
        listenMqtt(callback?: (err: Error | null, message: IFCAU_ListenMessage) => void): EventEmitter & { stopListening: (callback?: () => void) => void };
        logout: (callback?: (err?: Error) => void) => Promise<void>,
        markAsDelivered(threadID: string, messageID: string, callback?: (err?: Error) => void): Promise<void>,
        markAsRead(threadID: string, read?: boolean, callback?: (err?: Error) => void): Promise<void>,
        markAsReadAll: (callback?: (err?: Error) => void) => Promise<void>,
        markAsSeen(seenTimestamp?: number, callback?: (err?: Error) => void): Promise<void>,
        muteThread: (threadID: string, muteSeconds: number, callback?: (err?: Error) => void) => Promise<void>,
        pinMessage: (pinMode: boolean, messageID: string, threadID: string, callback?: (err?: Error) => void) => Promise<void>,
        removeUserFromGroup: (userID: string, threadID: string, callback?: (err?: Error) => void) => Promise<void>,
        resolvePhotoUrl: (photoID: string, callback?: (err: Error | null, url: string) => void) => Promise<string>,
        sendMessage: typeof sendMessage,
        sendTypingIndicator: (threadID: string, callback?: (err?: Error) => void) => Promise<void>,
        sendTypingIndicatorMqtt: (isTyping: boolean, threadID: string, callback?: (err?: Error) => void) => Promise<void>,
        setMessageReaction: (reaction: string, messageID: string, callback?: (err?: Error) => void, forceCustomReaction?: boolean) => Promise<void>,
        setMessageReactionMqtt: (reaction: string, messageID: string, threadID: string, callback?: (err?: Error) => void) => Promise<void>,
        setOptions: (options: Partial<IFCAU_Options>) => void,
        setEditOptions: (opts: EditOptions) => void,
        setBackoffOptions: (opts: { base?: number; max?: number; factor?: number; jitter?: number }) => void,
        enableLazyPreflight: (enable?: boolean) => void,
        getHealthMetrics: () => any,
        getMemoryMetrics: () => { pendingEdits: number; pendingEditsDropped: number; pendingEditsExpired: number; outboundQueueDepth: number; groupQueueDroppedMessages: number; memoryGuardRuns: number; memoryGuardActions: number } | null,
        setTitle: (newTitle: string, threadID: string, callback?: (err?: Error) => void) => Promise<void>,
        setTheme: (threadID: string, themeID?: string, callback?: (err?: Error) => void) => Promise<void>,
        unsendMessage: (messageID: string, callback?: (err?: Error) => void) => Promise<void>,
        unsendMessageMqtt: (messageID: string, threadID: string, callback?: (err?: Error) => void) => Promise<void>,
    }

    export type IFCAU_ListenMessage =
        {
            type: "message",
            attachments: IFCAU_Attachment[],
            args: string[],
            body: string,
            isGroup: boolean,
            mentions: { [id: string]: string },
            messageID: string,
            senderID: string,
            threadID: string,
            isUnread: boolean,
            participantIDs: string[]
        } |
        {
            type: "event",
            author: string,
            logMessageBody: string,
            logMessageData: {
                image: {
                    attachmentID: string,
                    width: number,
                    height: number,
                    url: string
                }
            },
            logMessageType: "log:thread-image",
            threadID: string
        } |
        {
            type: "event",
            author: string,
            logMessageBody: string,
            logMessageData: {
                addedParticipants: {
                    fanoutPolicy: string,
                    firstName: string,
                    fullName: string,
                    groupJoinStatus: string,
                    initialFolder: string,
                    initialFolderId: {
                        systemFolderId: string,
                    },
                    lastUnsubscribeTimestampMs: string,
                    userFbId: string,
                    isMessengerUser: boolean
                }[],
            },
            logMessageType: "log:subscribe",
            threadID: string,
            participantIDs: string[]
        } |
        {
            type: "event",
            author: string,
            logMessageBody: string,
            logMessageData: { leftParticipantFbId: string },
            logMessageType: "log:unsubscribe",
            threadID: string,
            participantIDs: string[]
        } |
        {
            type: "event",
            author: string,
            logMessageBody: string,
            logMessageData: { name: string },
            logMessageType: "log:thread-name",
            threadID: string,
            participantIDs: string[]
        } |
        {
            type: "event",
            author: string,
            logMessageBody: string,
            logMessageData: {
                theme_color: string,
                gradient?: string,
                should_show_icon: string,
                theme_id: string,
                accessibility_label: string,
                theme_name_with_subtitle: string,
                theme_emoji?: string
            },
            logMessageType: "log:thread-color",
            threadID: string,
            participantIDs: string[]
        } |
        {
            type: "event",
            author: string,
            logMessageBody: string,
            logMessageData: {
                thread_quick_reaction_instruction_key_id: string,
                thread_quick_reaction_emoji: string,
                thread_quick_reaction_emoji_url: string
            },
            logMessageType: "log:thread-icon",
            threadID: string,
            participantIDs: string[]
        } |
        {
            type: "event",
            author: string,
            logMessageBody: string,
            logMessageData: {
                nickname: string,
                participant_id: string
            },
            logMessageType: "log:user-nickname",
            threadID: string,
            participantIDs: string[]
        } |
        {
            type: "event",
            author: string,
            logMessageBody: string,
            logMessageData: {
                THREAD_CATEGORY: string,
                TARGET_ID: string,
                ADMIN_TYPE: string,
                ADMIN_EVENT: 'add_admin' | 'remove_admin'
            },
            logMessageType: "log:thread-admins",
            threadID: string,
            participantIDs: string[]
        } |
        {
            type: "event",
            author: string,
            logMessageBody: string,
            logMessageData: {
                removed_option_ids: string,
                question_json: string,
                event_type: 'question_creation' | 'update_vote' | 'add_unvoted_option' | 'multiple_updates',
                added_option_ids: string,
                new_option_texts: string,
                new_option_ids: string,
                question_id: string,
            },
            logMessageType: "log:thread-poll",
            threadID: string,
            participantIDs: string[]
        } |
        {
            type: "event",
            author: string,
            logMessageBody: string,
            logMessageData: { APPROVAL_MODE: '0' | '1', THREAD_CATEGORY: string },
            logMessageType: "log:thread-approval-mode",
            threadID: string,
            participantIDs: string[]
        } |
        {
            type: "event",
            author: string,
            logMessageBody: string,
            logMessageData: any,
            logMessageType: "log:thread-call",
            threadID: string,
            participantIDs: string[]
        } |
        {
            type: "typ",
            from: string,
            fromMobile: boolean,
            isTyping: boolean,
            threadID: string
        } |
        {
            type: "read",
            threadID: string,
            time: number,
        } |
        {
            type: "read_receipt",
            reader: string,
            threadID: string,
            time: number
        } | {
            type: "message_reaction",
            threadID: string,
            messageID: string,
            reaction: string,
            senderID: string,
            userID: string,
            reactionTimestamp: number
        } | {
            type: "presence",
            statuses: number,
            timestamp: number,
            userID: string
        } | {
            type: "message_unsend",
            threadID: string,
            senderID: string,
            messageID: string,
            deletionnTimestamp: number
        } | {
            type: "message_reply"
            attachments: IFCAU_Attachment[],
            args: string[],
            body: string,
            isGroup: boolean,
            mentions: { [id: string]: string },
            messageID: string,
            senderID: string,
            threadID: string,
            isUnread: boolean,
            participantIDs: string[],
            messageReply: {
                attachments: IFCAU_Attachment[],
                body: string,
                isGroup: boolean,
                mentions: { [id: string]: string },
                messageID: string,
                senderID: string,
                threadID: string,
                isUnread: boolean
            }
        };

    export type IFCAU_Attachment =
        {
            type: "sticker",
            ID: string,
            url: string,
            packID: string,
            spriteUrl: string,
            spriteUrl2x: string,
            width: number,
            height: number,
            caption: string,
            description: string,
            frameCount: number,
            frameRate: number,
            framesPerRow: number,
            framesPerCol: number
        } |
        {
            type: "file",
            ID: string,
            filename: string,
            url: string,
            isMalicious: boolean,
            contentType: string
        } |
        {
            type: "photo",
            ID: string,
            filename: string,
            thumbnailUrl: string,
            previewUrl: string,
            previewWidth: number,
            previewHeight: number,
            largePreviewUrl: string,
            largePreviewWidth: number,
            largePreviewHeight: number,
            url: string,
            width: number,
            height: number
        } |
        {
            type: "animated_image",
            ID: string,
            filename: string,
            previewUrl: string,
            previewWidth: number,
            previewHeight: number,
            url: string,
            width: number,
            height: number
        } |
        {
            type: "video",
            ID: string,
            filename: string,
            previewUrl: string,
            previewWidth: number,
            previewHeight: number,
            url: string,
            width: number,
            height: number
            duration: number,
            videoType: string
        } |
        {
            type: "audio",
            ID: string,
            filename: string,
            audioType: string,
            duration: number,
            url: string,
            isVoiceMail: boolean
        } |
        {
            type: "location",
            ID: string,
            latitude: number,
            longitude: number,
            image: string,
            width: number,
            height: number,
            url: string,
            address: string
        } |
        {
            type: "share",
            ID: string,
            url: string,
            title: string,
            description: string,
            source: string,
            image: string,
            width: number,
            height: number,
            playable: boolean,
            duration: number,
            playableUrl: string,
            subattachments: any,
            properties: any
        }

    export type IFCAU_User = {
        name: string,
        firstName?: string,
        vanity?: string,
        thumbSrc: string,
        profileUrl: string | null,
        gender?: number,
        type: string,
        isFriend?: boolean,
        isBirthday: boolean,
        searchToken: any,
        alternateName?: string
    }

    export type IFCAU_UserIDResponse = {
        userID: string,
        photoUrl: string,
        indexRank: number,
        name: string,
        isVerified: boolean,
        profileUrl: string,
        category: string,
        score: number,
        type: string
    }[];

    export type IFCAU_Options = {
        pauseLog: boolean,
        logLevel: "silly" | "verbose" | "info" | "http" | "warn" | "error" | "silent",
        selfListen: boolean,
        listenEvents: boolean,
        pageID: string,
        updatePresence: boolean,
        forceLogin: boolean,
        userAgent: string,
        autoMarkDelivery: boolean,
        autoMarkRead: boolean,
        proxy: string,
        online: boolean
    }

    export type IFCAU_Friend = {
        alternativeName: string,
        firstName: string,
        gender: string,
        userID: string,
        isFriend: boolean,
        fullName: string,
        profilePicture: string,
        type: string,
        profileUrl: string,
        vanity: string,
        isBirthday: boolean
    }

    export type IFCAU_Thread = {
        threadID: string,
        participantIDs: string[],
        threadName: string,
        userInfo: (IFCAU_User & { id: string })[],
        nicknames: { [id: string]: string } | null,
        unreadCount: number,
        messageCount: number,
        imageSrc: string,
        timestamp: number,
        muteUntil: number | null,
        isGroup: boolean,
        isSubscribed: boolean,
        folder: 'INBOX' | 'ARCHIVE' | string,
        isArchived: boolean,
        cannotReplyReason: string | null,
        lastReadTimestamp: number,
        emoji: string | null,
        color: string | null,
        adminIDs: string[],
        approvalMode: boolean,
        approvalQueue: { inviterID: string, requesterID: string, timestamp: string }[]
    }

    export type IFCAU_ThreadList = {
        threadID: string,
        name: string,
        unreadCount: number,
        messageCount: number,
        imageSrc: string,
        emoji: string | null,
        color: string | null,
        nicknames: { userid: string, nickname: string }[],
        muteUntil: number | null,
        participants: IFCAU_ThreadList_Participants[],
        adminIDs: string[],
        folder: "INBOX" | "ARCHIVED" | "PENNDING" | "OTHER" | string,
        isGroup: boolean,
        customizationEnabled: boolean,
        participantAddMode: string,
        reactionMuteMode: string,
        isArchived: boolean,
        isSubscribed: boolean,
        timestamp: number,
        snippet: string,
        snippetAttachments: string
        snippetSender: string,
        lastMessageTimestamp: number,
        listReadTimestamp: number | null,
        cannotReplyReason: string | null,
        approvalMode: string
    }[]

    export type IFCAU_ThreadList_Participants =
        {
            accountType: "User",
            userID: string,
            name: string,
            shortName: string,
            gender: string,
            url: string,
            profilePicture: string,
            username: string | null,
            isViewerFriend: boolean,
            isMessengerUser: boolean,
            isVerified: boolean,
            isMessageBlockedByViewer: boolean,
            isViewerCoworker: boolean
        } |
        {
            accountType: "Page",
            userID: string,
            name: string,
            url: string,
            profilePicture: string,
            username: string | null,
            acceptMessengerUserFeedback: boolean,
            isMessengerUser: boolean,
            isVerified: boolean,
            isMessengerPlatformBot: boolean,
            isMessageBlockedByViewer: boolean,
        } |
        {
            accountType: "ReducedMessagingActor",
            userID: string,
            name: string,
            url: string,
            profilePicture: string,
            username: string | null,
            acceptMessengerUserFeedback: boolean,
            isMessageBlockedByViewer: boolean
        } |
        {
            accountType: "UnavailableMessagingActor",
            userID: string,
            name: string,
            url: null,
            profilePicture: string,
            username: null,
            acceptMessengerUserFeedback: boolean,
            isMessageBlockedByViewer: boolean
        } |
        {
            accountType: string,
            userID: string,
            name: string
        };

    // Edit Options Type
    export interface EditOptions {
        maxEdits?: number;
        editWindowMs?: number;
        allowEditHistory?: boolean;
        [key: string]: any;
    }

    // Enhanced Database Types
    interface DatabaseOptions {
        dbPath?: string;
        cacheSize?: number;
        journalMode?: 'DELETE' | 'TRUNCATE' | 'PERSIST' | 'MEMORY' | 'WAL' | 'OFF';
        synchronous?: 'OFF' | 'NORMAL' | 'FULL' | 'EXTRA';
    }

    interface SessionData {
        id: string;
        userId?: string;
        appState: any;
        cookies?: any;
        tokens?: any;
        expiresAt?: number;
        isActive?: boolean;
        metadata?: Record<string, any>;
    }

    // Enhanced Performance Manager
    class PerformanceManager {
        constructor(options?: { cacheSize?: number; metricsRetention?: number });
        
        // Caching
        setCache(key: string, value: any, ttl?: number): Promise<boolean>;
        getCache(key: string): Promise<any>;
        deleteCache(key: string): Promise<boolean>;
        clearCache(): Promise<void>;
        
        // Rate Limiting DISABLED for maximum safety - no checkRateLimit method
        
        // Metrics
        recordMetric(name: string, value: number, tags?: Record<string, string>): void;
        getMetrics(): PerformanceMetrics;
        
        // Memory Management
        optimizeMemory(): void;
        getMemoryUsage(): { used: number; total: number; percentage: number };
    }

    // Enhanced Error Handler
    class ErrorHandler {
        constructor(options?: { 
            retryOptions?: RetryOptions;
            circuitBreakerOptions?: CircuitBreakerOptions;
            fallbackStrategies?: Record<string, () => any>;
        });
        
        handleError(error: Error, context?: string): Promise<any>;
        retry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;
        getFallback(context: string): () => any;
        setFallback(context: string, fallback: () => any): void;
        getErrorStats(): { 
            totalErrors: number; 
            errorsByType: Record<string, number>; 
            circuitBreakerState: string;
        };
    }

    // Enhanced MQTT Manager
    class AdvancedMqttManager extends NodeEventEmitter {
        constructor(options?: MqttConnectionOptions);
        
        connect(): Promise<void>;
        disconnect(): Promise<void>;
        reconnect(): Promise<void>;
        isConnected(): boolean;
        getConnectionState(): MqttConnectionState;
        
        // Message handling
        sendMessage(topic: string, message: any): Promise<void>;
        subscribe(topic: string, handler: (message: any) => void): void;
        unsubscribe(topic: string): void;
        
        // Health monitoring
        startHeartbeat(): void;
        stopHeartbeat(): void;
        getHealthStatus(): { 
            isHealthy: boolean; 
            lastHeartbeat: number; 
            connectionUptime: number;
        };
    }

    // Enhanced Database
    class EnhancedDatabase extends NodeEventEmitter {
        constructor(options?: DatabaseOptions);
        
        initialize(): Promise<void>;
        close(): Promise<void>;
        
        // User management
        saveUser(user: Partial<fcaUser>): Promise<fcaUser>;
        getUser(userId: string): Promise<fcaUser | null>;
        
        // Thread management
        saveThread(thread: Partial<fcaThread>): Promise<fcaThread>;
        getThread(threadId: string): Promise<fcaThread | null>;
        
        // Message management
        saveMessage(message: Partial<FcaMessage>): Promise<FcaMessage>;
        getMessages(threadId: string, limit?: number, before?: number): Promise<FcaMessage[]>;
        
        // Session management
        saveSession(session: SessionData): Promise<SessionData>;
        getActiveSession(userId?: string): Promise<SessionData | null>;
        
        // Cache management
        setCache(key: string, value: any, ttl?: number): Promise<boolean>;
        getCache(key: string): Promise<any>;
        
        // Event logging
        logEvent(eventType: string, data?: Record<string, any>): Promise<void>;
        
        // Maintenance
        cleanup(): Promise<void>;
    }

    // Compatibility Layer
    class CompatibilityLayer {
        constructor(api: IFCAU_API);
        
        // @anbuinfosec/fca-unofficial compatibility utilities
        createWrapper(packageName: '@anbuinfosec/fca-unofficial'): any;
        createLegacyApi(): any;
        autoAdapt(api: any): any;
        
        // Middleware
        addInterceptor(type: 'request' | 'response', interceptor: (data: any) => any): void;
        removeInterceptor(type: 'request' | 'response', interceptor: (data: any) => any): void;
    }
}