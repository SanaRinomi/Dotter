const pg = require("./dbKnexConf");
const moment = require("moment");
const {SimpleLevels} = require("../../classes/Level");

const DBTable = require("./dbTable");

class UserTable extends DBTable {
    constructor(tablename = "users") {
        super(tablename, table => {
            table.bigInteger("id").unsigned().primary();
            table.json("profile");
            table.json("cosmetics");
            table.json("limits");
            table.json("level");
        });
    }

    async upsert(id, profile, cosmetics, limits, level) {
        return super.upsert(id, {profile, cosmetics, limits, level});
    }
}

class GuildUserTable extends DBTable {
    constructor(tablename = "guildusers") {
        super(tablename, table => {
            table.bigInteger("user").unsigned();
            table.bigInteger("guild").unsigned();
            table.integer("permissions").unsigned();
            table.json("roles");
            table.json("logs");
            table.json("level");
            table.primary(["user", "guild"]);
        });
    }

    async upsert(user, guild, permissions, roles, logs, level) {
        return super.upsert({user, guild}, {permissions, roles, logs, level});
    }

    async get(user, guild) {
        return super.get({user, guild});
    }
}

const UserData = new UserTable(), GuildUserData = new GuildUserTable();

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
    return await UserData.upsert(id, profile, cosmetics, limits, level, table);
};

let guserConvert = async function(user, guild, leveling, logs = [], table = "guildusers") {
    let level = leveling ? leveling : new SimpleLevels().toJSON();
    return await GuildUserData.upsert(user, guild, 0, [], logs, level, table);
};

module.exports = {
    userConvert,
    guserConvert,
    GuildUserData,
    UserData,
    classes: {
        UserTable,
        GuildUserTable
    }
};