const pg = require("../dbKnexConf");
const moment = require("moment");
const {SimpleLevels} = require("../../classes/Level");

let remakeUserTable = async function(table = "users") {
    if(await pg.schema.hasTable(table))
        await pg.schema.dropTable(table);
    await pg.schema.createTable(table, ntable => {
        ntable.bigInteger("id").unsigned().primary();
        ntable.json("profile");
        ntable.json("cosmetics");
        ntable.json("limits");
        ntable.json("level");
    });

    return true;
};

let remakeGUserTable = async function(table = "guildusers") {
    if(await pg.schema.hasTable(table))
        await pg.schema.dropTable(table);
    await pg.schema.createTable(table, ntable => {
        ntable.bigInteger("user").unsigned();
        ntable.bigInteger("guild").unsigned();
        ntable.integer("permissions").unsigned();
        ntable.json("roles");
        ntable.json("logs");
        ntable.json("level");
        ntable.primary(["user", "guild"]);
    });

    return true;
};

let upsertUser = async function(id, profile, cosmetics, limits, level, table = "users") {
    let res = await pg.from(table).select().where({id});
    if(res.length && res[0]) {
        res = await pg(table).where({id}).update({profile: JSON.stringify(profile), cosmetics: JSON.stringify(cosmetics), limits: JSON.stringify(limits), level: JSON.stringify(level)}, ["id"]);
    } else {
        res = await pg(table).returning(["id"]).insert({id, profile: JSON.stringify(profile), cosmetics: JSON.stringify(cosmetics), limits: JSON.stringify(limits), level: JSON.stringify(level)});
    }

    if(Array.isArray(res) && res.length)
        return true;
    else return false;
};

let upsertGuildUser = async function(user, guild, permissions, roles, logs, level, table = "guildusers") {
    let res = await pg.from(table).select().where({user, guild});
    if(res.length && res[0]) {
        res = await pg(table).where({user, guild}).update({permissions: JSON.stringify(permissions), roles: JSON.stringify(roles), logs: JSON.stringify(logs), level: JSON.stringify(level)}, ["user", "guild"]);
    } else {
        res = await pg(table).returning(["user", "guild"]).insert({user, guild, permissions: JSON.stringify(permissions), roles: JSON.stringify(roles), logs: JSON.stringify(logs), level: JSON.stringify(level)});
    }

    if(Array.isArray(res) && res.length)
        return true;
    else return false;
};

let userConvert = async function(id, data, leveling, table = "users") {
    let profile = data ? {
        username: data.username ? data.username : "",
        nickname: data.nickname ? data.nickname : "",
        description: data.description ? data.description : "",
        reputation: data.reputation ? data.reputation : 0,
        currency: data.currency ? data.currency : 0
    } : {
        username: "", nickname: "", description: "", reputation: 0, currency: 0
    };

    let currDate = moment().toDate();
    let limits = data && data.limits ? data.limits : {
        rep: currDate,
        daily: currDate,
        daily_count: 0
    };

    let cosmetics = data && data.background && data.background !== "Base" ? {
        backgrounds: ["Base", data.background],
        currBackground: data.background
    } : {
        backgrounds: ["Base"],
        currBackground: "Base"
    };

    let level = leveling ? leveling : new SimpleLevels().toJSON();
    return await upsertUser(id, profile, cosmetics, limits, level, table);
};

let guserConvert = async function(user, guild, leveling, table = "guildusers", oldtable) {
    let level = leveling ? leveling : new SimpleLevels().toJSON();
    return await upsertGuildUser(user, guild, 0, [], [], level, table, oldtable);
};

module.exports = {
    remakeUserTable,
    remakeGUserTable,
    upsertUser,
    upsertGuildUser,
    userConvert,
    guserConvert
};