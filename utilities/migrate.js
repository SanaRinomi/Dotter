const {getUsers} = require("./olddb/dbUser");
const {getGuilds} = require("./olddb/dbGuildBase");
const {getAllRoles} = require("./olddb/dbGuildRoles");
const {getEvents} = require("./olddb/dbLogs");
const {getAllLevels} = require("./olddb/dbLevels");
const {UserData, userConvert, GuildUserData, guserConvert} = require("./newdb/dbUsers");
const {guildConvert, GuildData} = require("./newdb/dbGuild");

getUsers().then(async v => {
    if(!v.success) throw new Error("Data retrieval failed");
    let table = await UserData.remake();
    if(!table) throw new Error("Table creation failed");
    Promise.all(v.data.map(async vv => {
        if(await userConvert(vv.id, vv.profile, vv.leveling))
            console.log(`[Success] User ${vv.id} was migrated`);
        else console.log(`[Error] User ${vv.id} wasn't migrated`);
    }));
});

getAllLevels().then(async v => {
    if(!v.success) throw new Error("Failed to retrive data");
    let table = await GuildUserData.remake();
    if(!table) throw new Error("Failed create table");
    Promise.all(v.data.map(async vv => {
        let logs = await getEvents(vv.user, vv.guild);
        if(logs.success ? await guserConvert(vv.user, vv.guild, vv.leveling, logs.data) : await guserConvert(vv.user, vv.guild, vv.leveling, []))
            console.log(`[Success] Guild User ${vv.user} - ${vv.guild} was migrated`);
        else console.log(`[Error] Guild User ${vv.user} - ${vv.guild} wasn't migrated`);
    }));

});

getGuilds().then(async v => {
    if(!v.success) throw new Error("Failed to retrive data");
    let table = await GuildData.remake();
    if(!table) throw new Error("Failed create table");
    Promise.all(v.data.map(async vv => {
        let roles = await getAllRoles(vv.id);
        if(roles.success ? await guildConvert(vv.id, vv.welcome, vv.logs, vv.filters, roles.roles) : await guildConvert(vv.id, vv.welcome, vv.logs, vv.filters, []))
            console.log(`[Success] Guild ${vv.id} was migrated`);
        else console.log(`[Error] Guild ${vv.id} wasn't migrated`);
    }));
});