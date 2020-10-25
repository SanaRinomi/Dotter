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

    async get(user, guild) {
        return super.get({user, guild});
    }
}

module.exports = {
    UserTable,
    GuildUserTable
};