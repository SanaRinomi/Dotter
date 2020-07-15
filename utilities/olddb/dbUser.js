const pg = require("../dbKnexConf");

pg.schema.hasTable("users").then(exists => {
    if(!exists) {
        pg.schema.createTable("users", table => {
            table.bigInteger("id").unsigned().notNullable().unique();
            table.json("leveling").nullable();
            table.json("profile").nullable();
        }).then();
    }
});

let isUserStored = async function(id) {
    let res = await pg.from("users").select(["id"]).where({id});
    return res.length ? true : false;
};

let addUser = async function(id, profile, leveling) {
    let res = await pg("users").returning(["id"]).insert({id, profile: JSON.stringify(profile), leveling: JSON.stringify(leveling)});
    
    return Array.isArray(res) && res.length ? true : false;
};

let getUser = async function(id) {
    let res = await pg.from("users").select(["profile", "leveling"]).where({id});
    if(res.length && res[0])
        return {id: id, success: true, data: res[0]};
    else return {id: id, success: false};
};

let getUsers = async function() {
    let res = await pg.from("users").select();
    if(res.length && res[0])
        return {success: true, data: res};
    else return {success: false};
};

let setUsers = function(arr) {
    arr.forEach(async v => {
        if(await isUserStored(v.id)) 
            await updateAll(v.id, v.profile, v.leveling);
        else await addUser(v.id, v.profile, v.leveling);
    });
    if(res.length && res[0])
        return {success: true, data: res[0]};
    else return {success: false};
};

let updateAll = async function(id, profile, leveling) {
    let res = await pg("users").where({id}).update({leveling: JSON.stringify(leveling), profile: JSON.stringify(profile)}, ["id"]);
    
    if(Array.isArray(res) && res.length)
        return true;
    else return false;
};

let updateLevel = async function(id, leveling) {
    let res = await pg("users").where({id}).update({leveling: JSON.stringify(leveling)}, ["id"]);
    
    if(Array.isArray(res) && res.length)
        return true;
    else return false;
};

let updateProfile = async function(id, profile) {
    let res = await pg("users").where({id}).update({profile: JSON.stringify(profile)}, ["id"]);
    
    if(Array.isArray(res) && res.length)
        return true;
    else return false;
};

module.exports = {
    isUserStored,
    addUser,
    getUser,
    getUsers,
    setUsers,
    updateLevel,
    updateProfile
};