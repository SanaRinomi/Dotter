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

module.exports = {
    UserTable,
    GuildUserTable
};