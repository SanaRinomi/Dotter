const pg = require("./dbKnexConf");
const DBTable = require("./dbTable");

class GuildTable extends DBTable {
    constructor(tablename = "guilds") {
        super(tablename, table => {
            table.bigInteger("id").unsigned().primary();
            table.json("roles");
            table.json("configs");
            table.json("extra").nullable();
        });
    }
}

module.exports = {
    GuildTable
};