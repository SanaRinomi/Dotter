const pg = require("./dbKnexConf");

const ROLE_TYPES = {
    MUTE_ROLE: 1,
    USER_ROLES: 2
};

pg.schema.hasTable("roles").then(exists => {
    if(!exists) {
        pg.schema.createTable("roles", table => {
            table.bigInteger("id").unsigned().notNullable();
            table.integer("type").unsigned().nullable();
            table.json("roles").nullable();
        }).then();
    }
});

let isRoleStored = async function(id, type) {
    let res = await pg.from("roles").select(["id"]).where({id, type});
    return res.length ? true : false;
};

let getValue = async function(id, type) {
    let res = await pg.from("roles").select(["roles"]).where({id, type});
    if(res.length)
        return {id: id, success: true, roles: res[0].roles.data};
    else return {id: id, success: false};
};

let getAllRoles = async function(id) {
    let res = await pg.from("roles").select(["type", "roles"]).where({id});
    if(res.length){
        let arr = res.map(v => {
            return {
                type: v.type,
                roles: v.roles.data
            };
        });
        return {id: id, success: true, roles: arr};
    }
    else return {id: id, success: false};
};

let addRoles = async function(id, type, roles) {
    let res;
    if(!await isRoleStored(id, type)){
        res = await pg("roles").returning(["id"]).insert({id, type, roles: JSON.stringify({data: roles})});
    }
    
    if(Array.isArray(res) && res.length)
        return true;
    else return false;
};

let changeValue = async function(id, type, roles) {
    let res;
    if(await isRoleStored(id, type))
        res = await pg("roles").where({id, type}).update({roles: JSON.stringify({data: roles})}, ["roles"]);
    
    if(Array.isArray(res) && res.length)
        return true;
    else return false;
};

module.exports = {
    ROLE_TYPES,
    addRoles,
    getValue,
    getAllRoles,
    changeValue
};