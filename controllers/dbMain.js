const guild = require("./dbGuildBase");
const roles = require("./dbGuildRoles");
const timed = require("./dbTimedEvents");
const commands = require("./dbComms");
const users = require("./dbUser");
const levels = require("./dbLevels");

module.exports = {
    guild,
    roles,
    timed,
    commands,
    users,
    levels
};