const pg = require("../dbKnexConf");
const {EVENTS} = require("../../controllers/constants");

pg.schema.hasTable("logs").then(exists => {
    if(!exists) {
        pg.schema.createTable("logs", table => {
            table.bigInteger("guild").unsigned().notNullable();
            table.bigInteger("user").unsigned().notNullable();
            table.bigInteger("enforcer").unsigned().nullable();
            table.integer("type").unsigned().notNullable();
            table.text("reason").nullable();
            table.timestamp("created_at").defaultTo(pg.fn.now());
            table.json("extra").nullable();
        }).then();
    }
});

let isUserStored = async function(user) {
    let res = await pg.from("logs").select(["user"]).where({user});
    return res.length ? true : false;
};

let getGuildsStored = async function(user, guilds) {
    let res = await pg.from("logs").select(["guild"]).where({user}).whereIn("guild", guilds);
    return res.length ? res.map(v => v.guild) : [];
};

let addEvent = async function(user, guild, type, enforcer = null, reason = null, extra = null) {
    let res = await pg("logs").returning(["user"]).insert({user, guild, type, enforcer, reason, extra: extra ? JSON.stringify(extra) : null});
    
    return Array.isArray(res) && res.length ? true : false;
};

let getEvents = async function(user, guild) {
    let res = await pg.from("logs").select(["enforcer", "type", "reason", "created_at", "extra"]).where({user, guild});
    if(res.length && res[0])
        return {id: user, success: true, data: res};
    else return {id: user, success: false};
};

let getOffenses = async function(user, guild) {
    let res = await pg.from("logs").select(["enforcer", "type", "reason", "created_at", "extra"]).where({user, guild}).whereIn("type", [EVENTS.USER_BANNED, EVENTS.USER_UNBANNED, EVENTS.USER_KICKED, EVENTS.MUTED, EVENTS.UNMUTED, EVENTS.WARNS]);
    if(res.length && res[0])
        return {id: user, success: true, data: res};
    else return {id: user, success: false};
};

module.exports = {
    isUserStored,
    getGuildsStored,
    addEvent,
    getEvents,
    getOffenses
};