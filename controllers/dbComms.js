const pg = require("./dbKnexConf");

pg.schema.hasTable("comms").then(exists => {
    if(!exists) {
        pg.schema.createTable("comms", table => {
            table.increments("id").primary();
            table.text("path");
            table.string("nodeid");
            table.json("extra");
            table.timestamps();
        }).then();
    }
});

let isCommandStored = async function(path, nodeid) {
    let res = await pg.from("comms").select(["id"]).where({path, nodeid});
    return res.length ? res[0].id : false;
};

let addCommand = async function(path, nodeid, extra) {
    let res = await pg("comms").returning(["id"]).insert({path, nodeid, extra: JSON.stringify(extra)});
    
    return Array.isArray(res) && res.length ? res[0].id : false;
};

let UpdateCommand = async function(id, data = {name: "", description: "", permissions: [], arguments: [], aliases: [], tags: [], nsfw: false, executable: false}) {
    let res = await pg.from("comms").select().where({id});
    let extra = JSON.stringify(data);
    if(res[0] && JSON.stringify(res[0].extra) !== extra) {
        res = await pg("comms").where({id}).update({extra}, ["id"]);
    }

    return Array.isArray(res) && res.length ? true : false;
};
module.exports = {
    isCommandStored,
    addCommand,
    UpdateCommand
};