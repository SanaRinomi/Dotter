const pg = require("../dbKnexConf");

pg.schema.hasTable("levels").then(exists => {
    if(!exists) {
        pg.schema.createTable("levels", table => {
            table.bigInteger("user").unsigned().notNullable();
            table.bigInteger("guild").unsigned().notNullable();
            table.json("leveling").nullable();
        }).then();
    }
});

let isUserStored = async function(user) {
    let res = await pg.from("levels").select(["user"]).where({user});
    return res.length ? true : false;
};

let getGuildsStored = async function(user, guilds) {
    let res = await pg.from("levels").select(["guild"]).where({user}).whereIn("guild", guilds);
    return res.length ? res.map(v => v.guild) : [];
};

let addLevel = async function(user, guild, leveling) {
    let res = await pg("levels").returning(["user"]).insert({user, guild, leveling: JSON.stringify(leveling)});
    
    return Array.isArray(res) && res.length ? true : false;
};

let getLevel = async function(user, guild) {
    let res = await pg.from("levels").select(["leveling"]).where({user, guild});
    if(res.length && res[0])
        return {id: user, success: true, data: res[0]};
    else return {id: user, success: false};
};

let getAllLevels = async function() {
    let res = await pg.from("levels").select();
    if(res.length && res[0])
        return {success: true, data: res};
    else return {success: false};
};

let getGuildsLevels = async function(user) {
    let res = await pg.from("levels").select(["guild", "leveling"]).where({user});
    if(res.length && res[0])
        return {id: user, success: true, data: res};
    else return {id: user, success: false};
};

let getUsersLevels = async function(guild) {
    let res = await pg.from("levels").select(["user", "leveling"]).where({guild});
    if(res.length && res[0])
        return {id: guild, success: true, data: res};
    else return {id: guild, success: false};
};

let updateLevel = async function(user, guild, leveling) {
    let res = await pg("levels").where({user, guild}).update({leveling: JSON.stringify(leveling)}, ["user"]);
    
    if(Array.isArray(res) && res.length)
        return true;
    else return false;
};

module.exports = {
    isUserStored,
    getGuildsStored,
    addLevel,
    getLevel,
    getAllLevels,
    getGuildsLevels,
    getUsersLevels,
    updateLevel
};