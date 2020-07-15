const Config = require("../config.json");
const pg = require("knex")(Config.db);

module.exports = pg;