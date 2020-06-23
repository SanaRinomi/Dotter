const PRIORITIES = {
    LOW: "#4256f4",
    MEDIUM: "#50e542",
    HIGH: "#eadc10",
    CRITICAL: "#e00f0f"
};

const EVENTS = {
    USER_JOIN: 0,
    USER_LEAVE: 1,
    USER_KICKED: 2,
    USER_BANNED: 3,
    MESSAGE_DELETED: 4,
    MUTED: 5,
    WARNS: 6,
    UNMUTED: 7,
    USER_UNBANNED: 8,
};

const TIMED_EVENTS = { // Used to be TIMED_E_TYPES
    REMIND_ME: 1,
    BAN_LIMIT: 2,
    MUTE_LIMIT: 3
};

const ROLE_TYPES = {
    MUTE_ROLE: 1,
    USER_ROLES: 2
};

module.exports = {
    PRIORITIES,
    EVENTS,
    TIMED_EVENTS,
    ROLE_TYPES
};