const pg = require("../dbKnexConf");
const moment = require("moment");
const {SimpleLevels} = require("../../classes/Level");

let remakeUserTable = async function(table = "users") {
    if(await pg.schema.hasTable(table))
        await pg.schema.dropTable(table);
    await pg.schema.createTable(table, table => {
        table.bigInteger("id").unsigned().primary();
        table.json("profile");
        table.json("cosmetics");
        table.json("limits");
        table.json("level");
    });

    return true;
};

let remakeGUserTable = async function() {
    await pg.schema.dropTable("levels");
    await pg.schema.createTable("guildusers", table => {
        table.bigInteger("id").unsigned().notNullable().unique();
        table.json("permissions");
        table.json("roles");
        table.json("logs");
        table.json("level");
    });
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

let userConvert = async function(id, data, leveling, table = "users") {
    let profile = data ? {
        username: data.username ? data.username : "",
        nickname: data.nickname ? data.nickname : "",
        description: data.nickname ? data.nickname : "",
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

module.exports = {
    remakeUserTable,
    remakeGUserTable,
    upsertUser,
    userConvert
};