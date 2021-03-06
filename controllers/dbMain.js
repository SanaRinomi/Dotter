const DBTable = require("./dbTable");
const EventTable = require("./dbEvents");
const CommandsTable = require("./dbComms");
const {GuildTable} = require("./dbGuild");
const {UserTable, GuildUserTable} = require("./dbUsers");

const EventData = new EventTable(), GuildData = new GuildTable(), UserData = new UserTable(), GuildUserData = new GuildUserTable(), CommandData = new CommandsTable();

module.exports = {
    EventData,
    GuildData,
    UserData,
    GuildUserData,
    CommandData,
    tables: {
        EventTable,
        GuildTable,
        UserTable,
        GuildUserTable,
        CommandsTable,
        DBTable
    }
};