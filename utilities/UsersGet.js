const {users: {getUsers}} = require("../controllers/dbMain");
const fs = require("fs-extra");

getUsers().then(v => {
    if(v.success) {
        fs.writeJSON("./users.json", v.data);
    }
});