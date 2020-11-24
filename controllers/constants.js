/**
 * Priority object.
 * @typedef {Object} Priority
 * @property {number} ID - ID of the Priority
 * @property {string} NAME - Priority's name
 * @property {string} COLOR - Priority's color
 */


/**
 * Priority enum
 * @readonly
 * @enum {Priority}
 */
const PRIORITY = { // ID and properties on each Priority of an event.
    VERBOSE: { ID: 0, NAME: "Verbose", COLOR: "#D3D3D3"},
    LOW: { ID: 1, NAME: "Low", COLOR: "#4256F4"},
    MEDIUM: { ID: 2, NAME: "Medium", COLOR: "#50E542"},
    HIGH: { ID: 3, NAME: "High", COLOR: "#EADC10"},
    CRITICAL: { ID: 4, NAME: "Critical", COLOR: "#E00F0F"},
};


/**
 * Event object.
 * @typedef {Object} LogEvent
 * @property {number} ID - ID of the Event
 * @property {string} NAME - Event's name
 * @property {Priority} PRIORITY - Event's priority
 */

/**
 * Events enum
 * @readonly
 * @enum {LogEvent}
 */
const EVENTS = {
    ERROR: { ID: 0, NAME: "Error", PRIORITY: PRIORITY.CRITICAL},
    USER_JOIN: { ID: 1, NAME: "User Join", PRIORITY: PRIORITY.LOW},
    USER_LEAVE: { ID: 2, NAME: "User Leave", PRIORITY: PRIORITY.LOW},
    USER_KICKED: { ID: 3, NAME: "User Kicked", PRIORITY: PRIORITY.MEDIUM},
    USER_BANNED: { ID: 4, NAME: "User Banned", PRIORITY: PRIORITY.HIGH},
    USER_TEMP_BANNED: { ID: 5, NAME: "User Temp Banned", PRIORITY: PRIORITY.HIGH},
    USER_UNBANNED: { ID: 6, NAME: "User Unbanned", PRIORITY: PRIORITY.MEDIUM},
    USER_WARN: { ID: 7, NAME: "User Warned", PRIORITY: PRIORITY.LOW},
    USER_BOT_WARN: { ID: 8, NAME: "User Bot Warned", PRIORITY: PRIORITY.VERBOSE},
    USER_NICKNAME_CHANGE: { ID: 9, NAME: "User Nickname Changed", PRIORITY: PRIORITY.VERBOSE},
    USER_USERNAME_CHANGE: { ID: 10, NAME: "User Username Changed", PRIORITY: PRIORITY.VERBOSE},
    USER_MUTED: { ID: 11, NAME: "User Muted", PRIORITY: PRIORITY.MEDIUM},
    USER_TEMP_MUTED: { ID: 12, NAME: "User Temp Muted", PRIORITY: PRIORITY.MEDIUM},
    USER_UNMUTED: { ID: 13, NAME: "User Unmuted", PRIORITY: PRIORITY.LOW},
    MULTI_USER_WARN: { ID: 14, NAME: "Multiple Users Warned", PRIORITY: PRIORITY.MEDIUM},
    MULTI_USER_KICKED: { ID: 15, NAME: "Multiple Users Kicked", PRIORITY: PRIORITY.MEDIUM},
    MULTI_USER_BANNED: { ID: 16, NAME: "Multiple Users Banned", PRIORITY: PRIORITY.HIGH},
    MESSAGE_DELETED: { ID: 17, NAME: "Message Deleted", PRIORITY: PRIORITY.LOW},
    MESSAGE_EDITED: { ID: 18, NAME: "Message Edited", PRIORITY: PRIORITY.LOW},
    MESSAGE_PINNED: { ID: 19, NAME: "Message Pinned", PRIORITY: PRIORITY.VERBOSE}
};

const TIMER_TYPE = { // Types for timed events.
    REMINDER: 0,
    TEMP_MUTE: 1,
    TEMP_BAN: 2,
    SCHEDULED_MESSAGE: 3
};

const ROLE_TYPE = { // Types of role.
    USER_ROLE: 0,
    MUTE_ROLE: 1
};

module.exports = {
    PRIORITY,
    EVENTS,
    TIMER_TYPE,
    ROLE_TYPE
};