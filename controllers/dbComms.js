const DBTable = require("./dbTable");

class CommandsTable extends DBTable {
    constructor(tablename = "comms") {
        super(tablename, table => {
            table.increments("id").primary();
            table.text("path");
            table.string("nodeid");
            table.json("extra");
            table.timestamps();
        });
        this._generatedID = true;
    }
}

module.exports = CommandsTable;