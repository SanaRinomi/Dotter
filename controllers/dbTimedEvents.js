const pg = require("./dbKnexConf");
const moment = require("moment");

const TIMED_E_TYPES = {
    REMIND_ME: 1,
    BAN_LIMIT: 2,
    MUTE_LIMIT: 3
};

pg.schema.hasTable("timed").then(exists => {
    if(!exists) {
        pg.schema.createTable("timed", table => {
            table.bigIncrements("id");
            table.bigInteger("user").unsigned().notNullable();
            table.bigInteger("guild").unsigned().notNullable();
            table.integer("type").unsigned().nullable();
            table.timestamp("created_at").defaultTo(pg.fn.now());
            table.datetime("until");
            table.json("extra").nullable();
        }).then();
    }
});

function IsValidTime(str) {
    const regex = /(\d+) ([a-rA-R|t-zT-Z]+)([sS])?/gm;

    return regex.test(str);
}

function StringToTime(str) {
    let minutes = 0, hours = 0, days = 0, weeks = 0, months = 0, years = 0, error;

    const regex = /(\d+) ([a-rA-R|t-zT-Z]+)([sS])?/gm;
    const matches = [...str.matchAll(regex)];

    matches.forEach(v => {
        switch(v[2].toLowerCase()) {
            case "minute":
                minutes = v[1];
                break;
            case "hour":
                hours = v[1];
                break;
            case "day":
                days = v[1];
                break;
            case "week":
                weeks = v[1];
                break;
            case "month":
                months = v[1];
                break;
            case "year":
                years = v[1];
                break;
            default:
                error = v[0];
        }
    });

    if(error)
        return {success: false, value: error};
    
    const current = new Date();
    let target = moment(current);
    target.add({minutes, hours, days, weeks, months, years});
    return {success: true, value: {start: moment(current), end: target}};
}

let hasStoredValues = async function(user, guild, type) {
    let res = await pg.from("timed").select(["id"]).where({user, guild, type});
    return res.length ? true : false;
};

let hasStoredValue = async function(id) {
    let res = await pg.from("timed").select(["id"]).where({id});
    return res.length ? true : false;
};

let getValue = async function(id) {
    let res = await pg.from("timed").select(["extra"]).where({id});
    if(res.length)
        return {id: id, success: true, value: res[0]};
    else return {id: id, success: false};
};

let getValues = async function(user, guild, type) {
    let res = await pg.from("timed").select(["id", "extra"]).where({user, guild, type}).andWhere("until", "<=", pg.fn.now());
    if(res.length)
        return {id: id, success: true, values: res.map(v => {return {id: v.id, extra: v.extra};})};
    else return {id: id, success: false};
};

let getAllUserValues = async function(user) {
    let res = await pg.from("timed").select().where({user});
    if(res.length)
        return {id: user, success: true, values: res};
    else return {id: user, success: false};
};

let getAllGuildValues = async function(guild) {
    let res = await pg.from("timed").select().where({guild});
    if(res.length)
        return {id: guild, success: true, values: res};
    else return {id: guild, success: false};
};

let getAllCompletedValues = async function() {
    let res = await pg.from("timed").select().where("until", "<=", pg.fn.now());
    if(res.length)
        return {success: true, values: res};
    else return {success: false};
};

let getAllCompUserValues = async function(user) {
    let res = await pg.from("timed").select().where({user}).andWhere("until", "<=", pg.fn.now());
    if(res.length)
        return {id: user, success: true, values: res};
    else return {id: user, success: false};
};

let getAllCompGuildValues = async function(guild) {
    let res = await pg.from("timed").select().where({guild}).andWhere("until", "<=", pg.fn.now());
    if(res.length)
        return {id: guild, success: true, values: res};
    else return {id: guild, success: false};
};

let addTimedEvent = async function(user, guild, type, until, extra) {
    let res;
    res = await pg("timed").returning(["id"]).insert({user, guild, type, until, extra: extra ? JSON.stringify(extra) : null});
    
    if(Array.isArray(res) && res.length)
        return true;
    else return false;
};

let removeValue = async function(id, user) {
    let res;
    if(Array.isArray(id))
        res = await pg("timed").whereIn("id", id).del();
    else res = await pg("timed").where({id, user}).del();
    
    if(res)
        return true;
    else return false;
};

module.exports = {
    TIMED_E_TYPES,
    IsValidTime,
    StringToTime,
    getValues,
    getValue,
    getAllUserValues,
    getAllGuildValues,
    getAllCompletedValues,
    getAllCompUserValues,
    getAllCompGuildValues,
    addTimedEvent,
    removeValue,
    hasStoredValues,
    hasStoredValue
};