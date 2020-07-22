const pg = require("../dbKnexConf");

pg.schema.hasTable("guilds").then(exists => {
    if(!exists) {
        pg.schema.createTable("guilds", table => {
            table.bigInteger("id").unsigned().notNullable().unique().primary();
            table.json("welcome").nullable();
            table.json("announcements").nullable();
            table.json("logs").nullable();
            table.json("filters").nullable();
        }).then();
    }
});

let isGuildStored = async function(id) {
    let res = await pg.from("guilds").select(["id"]).where({id});
    return res.length ? true : false;
};

let getGuilds = async function() {
    let res = await pg.from("guilds").select();
    if(res.length && res[0])
        return {success: true, data: res};
    else return {success: false};
};

let getAnnouncements = async function(id) {
    let res = await pg.from("guilds").select(["announcements"]).where({id});
    if(res.length && res[0])
        return {id: id, success: true, data: res[0].announcements};
    else return {id: id, success: false};
};

let getWelcome = async function(id) {
    let res = await pg.from("guilds").select(["welcome"]).where({id});
    if(res.length && res[0] && res[0].welcome)
        return {id: id, success: true, data: res[0].welcome};
    else return {id: id, success: false};
};

let getLogs = async function(id) {
    let res = await pg.from("guilds").select(["logs"]).where({id});
    if(res.length && res[0])
        return {id: id, success: true, logs: res[0].logs};
    else return {id: id, success: false};
};

let getFilters = async function(id) {
    let res = await pg.from("guilds").select(["filters"]).where({id});
    if(res.length && res[0] && res[0].filters)
        return {id: id, success: true, data: res[0].filters};
    else return {id: id, success: false};
};

let addGuild = async function(id) {
    let res;
    if(!await isGuildStored(id)){
        res = await pg("guilds").returning(["id"]).insert({id});
    }
    
    if(Array.isArray(res) && res.length)
        return true;
    else return false;
};

let updateAnnouncements = async function(id, announcements) {
    let res;
    if(isGuildStored(id))
        res = await pg("guilds").where({id}).update({announcements}, ["id", "announcements"]);
    
    if(Array.isArray(res) && res.length)
        return true;
    else return false;
};

let updateWelcome = async function(id, welcome) {
    let res;
    if(isGuildStored(id))
        res = await pg("guilds").where({id}).update({welcome}, ["id", "welcome"]);
    
    if(Array.isArray(res) && res.length)
        return true;
    else return false;
};

let updateLogs = async function(id, logs) {
    let res;
    if(isGuildStored(id))
        res = await pg("guilds").where({id}).update({logs: JSON.stringify(logs)}, ["id", "logs"]);
    
    if(Array.isArray(res) && res.length)
        return true;
    else return false;
};

let updateFilters = async function(id, filters) {
    let res;
    if(isGuildStored(id))
        res = await pg("guilds").where({id}).update({filters: JSON.stringify(filters)}, ["id", "filters"]);
    
    if(Array.isArray(res) && res.length)
        return true;
    else return false;
};

module.exports = {
    isGuildStored,
    getAnnouncements,
    getWelcome,
    getLogs,
    getFilters,
    addGuild,
    updateAnnouncements,
    updateWelcome,
    updateLogs,
    updateFilters,
    getGuilds
};