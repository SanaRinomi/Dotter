const config = require("../config.json");

const pg = require("knex")(config.db);

module.exports = pg;