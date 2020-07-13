const moment = require("moment");

class DBObject {
    constructor(TTL = 3) {
        this._TTLAmount = TTL;
        this._TTL = moment().add(TTL, "minutes");
    }

    async sync() {
        if(this._TTL.isBefore()) {
            this._TTL = moment().add(this._TTLAmount, "minutes");
            this.load();
        }
    }

    async save() {}
    async load() {}
    toJSON() {}
    static async fetch(id) {}
    static get(id) {}
    static fromJSON(json) {}
}

module.exports = DBObject;