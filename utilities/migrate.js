const {getUsers} = require("./olddb/dbUser");
const {getEvents} = require("./olddb/dbLogs");
const {getAllLevels} = require("./olddb/dbLevels");
const {remakeUserTable, userConvert, remakeGUserTable, guserConvert} = require("./newdb/dbUsers");
const userTable = "newusers";
const guserTable = "guildusers";

getUsers().then(async v => {
    if(!v.success) throw new Error("Data retrieval failed");
    let table = await remakeUserTable(userTable);
    if(!table) throw new Error("Table creation failed");
    Promise.all(v.data.map(async vv => {
        if(await userConvert(vv.id, vv.profile, vv.leveling, userTable))
            console.log(`[Success] User ${vv.id} was migrated`);
        else console.log(`[Error] User ${vv.id} wasn't migrated`);
    }));
});

getAllLevels().then(async v => {
    if(!v.success) throw new Error("Failed to retrive data");
    let table = await remakeGUserTable(guserTable);
    if(!table) throw new Error("Failed create table");
    Promise.all(v.data.map(async vv => {
        let logs = await getEvents(vv.user, vv.guild);
        if(logs.success ? await guserConvert(vv.user, vv.guild, vv.leveling, logs.data, guserTable) : await guserConvert(vv.user, vv.guild, vv.leveling, [], guserTable))
            console.log(`[Success] Guild User ${vv.user} - ${vv.guild} was migrated`);
        else console.log(`[Error] Guild User ${vv.user} - ${vv.guild} wasn't migrated`);
    }));
});