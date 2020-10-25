const {BitField} = require("discord.js");

class GuildUserPerms extends BitField {}
GuildUserPerms.FLAGS = {
    SCHEDULE_MESSAGE: 1 << 0,
    READ_LOGS: 1 << 1,
    EDIT_LOGS: 1 << 2,
    EDIT_WELCOME: 1 << 3,
    MUTE_USER: 1 << 4
};

module.exports = GuildUserPerms;