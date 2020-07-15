const {getUsers} = require("./olddb/dbUser");
const {remakeUserTable, userConvert} = require("./newdb/dbUsers");
const userTable = "newusers";

getUsers().then(async v => {
    if(!v.success) throw new Error("Data retrieval failed");
    let table = await remakeUserTable(userTable);
    if(!table) throw new Error("Table creation failed");
    v.data.forEach(async vv => {
        if(await userConvert(vv.id, vv.profile, vv.leveling, userTable))
            console.log(`[Success] User ${vv.id} was registered`);
        else console.log(`[Error] User ${vv.id} wasn't registered`);
    });
});