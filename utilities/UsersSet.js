const {users: {setUsers}} = require("../controllers/dbMain");
const fs = require("fs-extra");

fs.readJSON("./users.json").then(v => {
    return setUsers(v);
}).then(v => {
    console.log(v.success);
});