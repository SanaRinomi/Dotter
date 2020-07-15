const pg = require("../dbKnexConf");

let remakeGuildTable = async function() {
    await pg.schema.dropTable("users");
    await pg.schema.createTable("users", table => {
        table.bigInteger("id").unsigned().notNullable().unique();
        table.json("roles");
        table.json("channels");
        table.json("filters");
        table.json("welcome");
    });
};

module.exports = {
    remakeGuildTable
};