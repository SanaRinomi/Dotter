const DBTable = require("./dbTable");
const EventTable = require("./dbEvents");
const {classes: {GuildTable}} = require("./dbGuild");
const {classes: {UserTable, GuildUserTable}} = require("./dbUsers");

const EventData = new EventTable(), GuildData = new GuildTable(), UserData = new UserTable(), GuildUserData = new GuildUserTable();

module.exports = {
    EventData,
    GuildData,
    UserData,
    GuildUserData,
    tables: {
        EventTable,
        GuildTable,
        UserTable,
        GuildUserTable,
        DBTable
    }
};