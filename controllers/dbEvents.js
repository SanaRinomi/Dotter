const pg = require("./dbKnexConf");
const DBTable = require("./dbTable");
const moment = require("moment");

class EventTable extends DBTable {
    constructor(tablename = "events") {
        super(tablename, table => {
            table.bigIncrements("id");
            table.bigInteger("user").unsigned().nullable();
            table.bigInteger("guild").unsigned().nullable();
            table.integer("type").unsigned().nullable();
            table.timestamp("created_at").defaultTo(pg.fn.now());
            table.datetime("until");
            table.json("extra").nullable();
        });
    }

    async upsert(id, roles, configs, extra = null) {
        return super.upsert(id, {roles,configs,extra});
    }

    async getCompleted(id = null, data = null) {
        let res;
        if(id)
            res = await pg.from(this._name).select(data).where(typeof id === "object" ? id : {id}).andWhere("until", "<=", pg.fn.now());
        else res = await pg.from(this._name).select(data).where("until", "<=", pg.fn.now());

        if(res.length && res[0])
            return {id: id, success: true, data: res};
        else return {id: id, success: false};
    }

    static isValidTime(str) {
        const regex = /(\d+) ([a-rA-R|t-zT-Z]+)([sS])?/gm;
    
        return regex.test(str);
    }

    static stringToTime(str) {
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

    isValidTime(str) {
        return EventTable.isValidTime(str);
    }

    stringToTime(str) {
        return EventTable.stringToTime(str);
    }
}

module.exports = EventTable;