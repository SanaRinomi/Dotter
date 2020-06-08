const guild = require("./dbGuildBase");
const roles = require("./dbGuildRoles");
const timed = require("./dbTimedEvents");
const commands = require("./dbComms");

module.exports = {
    guild,
    roles,
    timed,
    commands
};