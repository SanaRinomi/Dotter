const {Nodes: {CommandNode, AliasNode}, ConfirmationMessage} = require("framecord"),
    {Permissions: {FLAGS}} = require("discord.js"),
    DB = require("../../controllers/dbMain");

async function userRoleManager(command, msg, add = true) {
    const role = msg.mentions.roles.first();
    const roleVal = await DB.roles.getValue(msg.guild.id, DB.roles.ROLE_TYPES.USER_ROLES);

    let conf = new ConfirmationMessage(msg.author.id, async (obj) => {
        if(roleVal.success) {
            let roleArr = roleVal.roles ? roleVal.roles : [];

            let exists = roleArr.findIndex((v) => { return command.Args[0].ID === v.id; });

            if(exists === -1) {
                if(add) {
                    roleArr.push({id: command.Args[0].ID, name: role.name});

                    DB.roles.changeValue(msg.guild.id, DB.roles.ROLE_TYPES.USER_ROLES, roleArr).then(v => {
                        if(v)
                            obj.Message.edit("Roles configured!");
                        else obj.Message.edit("Failed to configure roles...! (Failed to set data)");
                    });
                } else {
                    obj.Message.edit("Failed to remove role...! (Role wasn't present in user role list)");
                }
                
            } else {
                if(add) {
                    obj.Message.edit("Failed to add role...! (Role already on list");
                } else {
                    roleArr.splice(exists, 1);
                    DB.roles.changeValue(msg.guild.id, DB.roles.ROLE_TYPES.USER_ROLES, roleArr).then(v => {
                        if(v)
                            obj.Message.edit("Roles configured!");
                        else obj.Message.edit("Failed to configure roles...! (Failed to set data)");
                    });
                }
            }                
        } else {
            let roleArr = [];
            if(add) {
                roleArr.push({id: command.Args[0].ID, name: role.name});

                DB.roles.addRoles(msg.guild.id, DB.roles.ROLE_TYPES.USER_ROLES, roleArr).then(v => {
                    if(v)
                        obj.Message.edit("Roles configured!");
                    else obj.Message.edit("Failed to configure roles...! (Failed to set data)");
                });
            } else {
                obj.Message.edit("Failed to remove role...! (Role wasn't present in user role list)");
            }
        }
    });

    conf.send(msg.channel, `Are you sure you want to ${add ? "add" : "remove"} role ${role.name} ${add ? "to" : "from"} user roles?`);
}

const roles = new CommandNode("roles", async (cli, command, msg) => {
    let roles = await DB.roles.getAllRoles(msg.guild.id);

    if(roles.success){
        let muted = roles.roles.find(v => {return v.type === DB.roles.ROLE_TYPES.MUTE_ROLE;});
        let user = roles.roles.find(v => {return v.type === DB.roles.ROLE_TYPES.USER_ROLES;});
        msg.channel.send(`\`\`\`md
# Role Settings
* Muted: ${muted && muted.roles[0] ? msg.guild.roles.cache.get(muted.roles[0]).name : "Nothing"}
* User Roles: ${user && user.roles[0] ? user.roles.map(v => { return v.name; }).join(", ") : "Nothing"}
\`\`\``);
    }
    else msg.channel.send("Failed to get any data...!");
}, {
    name: "See Roles",
    desc: "See set roles",
    perms: [FLAGS.SEND_MESSAGES]
});

const rolesAssign = new CommandNode("assign", async (cli, command, msg) => {
    const role = msg.mentions.roles.first();
    const mention = msg.mentions.members.first();
    const b = mention.roles.cache.get(role.id) ? true : false;
    const raMsg = new ConfirmationMessage(msg.author.id, (obj, reaction, user, deleted) => {
        if(b) mention.roles.remove(role.id).then(() => {obj.Message.channel.send(`Role \`${role.name}\` taken away from ${mention.user.username}!`);}).catch(err => {obj.Message.channel.send(`Error attempting to remove role: \`${err.message}\``);});
        else mention.roles.add(role.id).then(() => {obj.Message.channel.send(`Role \`${role.name}\` given to ${mention.user.username}!`);}).catch(err => {obj.Message.channel.send(`Error attempting to add role: \`${err.message}\``);});
    });
    raMsg.send(msg.channel, `Are you sure you want to ${b ? "take away" : "give"} the role ${role.name} to ${mention.user.username}?`);
}, {
    name: "Role assign",
    desc: "Assing a role to a user!",
    args: [{type: "user", name: "User", optional: false}, {type: "role", name: "Role", optional: false}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, FLAGS.MANAGE_ROLES]
});

const rolesUser = new CommandNode("user", async (cli, command, msg) => {
    let roles = await DB.roles.getValue(msg.guild.id, DB.roles.ROLE_TYPES.USER_ROLES);

    if(roles.success){
        msg.channel.send(`\`\`\`md
# User Roles Settings
* Roles: ${roles.roles[0] ? roles.roles.map(v => { return v.name; }).join(", ") : "Nothing"}
\`\`\``);
    }
    else msg.channel.send("Failed to get any data...!");
}, {
    name: "User roles",
    desc: "Return current user roles",
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const rolesUserRemove = new CommandNode("remove", async (cli, command, msg) => {
    userRoleManager(command, msg, false);
}, {
    name: "Remove user role",
    desc: "Remove user role",
    args: [{name: "Role", type: "role", optional: false}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const rolesUserAdd = new CommandNode("add", async (cli, command, msg) => {
    userRoleManager(command, msg);
}, {
    name: "Add user role",
    desc: "Add user role",
    args: [{name: "Role", type: "role", optional: false}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const rolesUserReset = new CommandNode("reset", async (cli, command, msg) => {
    const roleVal = await DB.roles.getValue(msg.guild.id, DB.roles.ROLE_TYPES.USER_ROLES);

    let conf = new ConfirmationMessage(msg.author.id, async (obj) => {

        if(roleVal.success) {
            if(roleVal.roles && roleVal.roles.length) {
                DB.roles.changeValue(msg.guild.id, DB.roles.ROLE_TYPES.USER_ROLES, []).then(v => {
                    if(v)
                        obj.Message.edit("Roles configured!");
                    else obj.Message.edit("Failed to configure roles...! (Failed to set data)");
                });
            } else {
                obj.Message.edit("Failed to reset roles...! (List is empty)");
            }      
        } else {
            obj.Message.edit("Failed to reset roles...! (List is empty)");
        }
    });

    conf.send(msg.channel, "Are you sure you want to reset all user roles?");
}, {
    name: "Reset user roles",
    desc: "Reset user roles",
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const roleMute = new CommandNode("mute", async (cli, command, msg) => {
    if(command.Args[0]){
        role = msg.mentions.roles.first();
        const roleVal = await DB.roles.getValue(msg.guild.id, DB.roles.ROLE_TYPES.USER_ROLES);

        let conf = new ConfirmationMessage(msg.author.id, async (obj) => {
            if(roleVal.success) {
                let roleArr = roleVal.roles ? roleVal.roles : [];

                if(command.Args[0].ID !== roleArr[0]) {
                    if(roleArr.length){
                        roleArr = [command.Args[0].ID];

                        DB.roles.changeValue(msg.guild.id, DB.roles.ROLE_TYPES.MUTE_ROLE, roleArr).then(v => {
                            if(v)
                                obj.Message.edit("Role configured!");
                            else obj.Message.edit("Failed to configure role...! (Failed to set data)");
                        });
                    } else {
                        roleArr = [command.Args[0].ID];
                        DB.roles.addRoles(msg.guild.id, DB.roles.ROLE_TYPES.MUTE_ROLE, roleArr).then(v => {
                            if(v)
                                obj.Message.edit("Role configured!");
                            else obj.Message.edit("Failed to configure role...! (Failed to set data)");
                        });
                    }
                    
                } else {
                    obj.Message.edit("Failed to add role...! (Role already set to that value)");
                }                
            } else {
                let roleArr = [command.Args[0].ID];
                DB.roles.addRoles(msg.guild.id, DB.roles.ROLE_TYPES.MUTE_ROLE, roleArr).then(v => {
                    if(v)
                        obj.Message.edit("Role configured!");
                    else obj.Message.edit("Failed to configure role...! (Failed to set data)");
                });;
            }
        });
    
        conf.send(msg.channel, `Are you sure you want to SET role ${role.name} from mute role?`);
    } else {
        let roles = await DB.roles.getValue(msg.guild.id, DB.roles.ROLE_TYPES.MUTE_ROLE);

        if(roles.success){
            msg.channel.send(`\`\`\`md
# Mute Role Settings
* Role: ${roles.roles[0] ? msg.guild.roles.cache.get(roles.roles[0]).name : "Nothing"}
\`\`\``);
        }
        else msg.channel.send("Failed to get any data...!");
    }
}, {
    name: "Manage mute role",
    desc: "Set mute role. If no arguments present, returns current mute role.",
    args: [{name: "Role", type: "role"}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const roleMuteReset = new CommandNode("reset", async (cli, command, msg) => {
    const roleVal = await DB.roles.getValue(msg.guild.id, DB.roles.ROLE_TYPES.MUTE_ROLE);

    let conf = new ConfirmationMessage(msg.author.id, async (obj) => {

        if(roleVal.success) {
            if(roleVal.roles && roleVal.roles.length) {
                DB.roles.changeValue(msg.guild.id, DB.roles.ROLE_TYPES.MUTE_ROLE, []).then(v => {
                    if(v)
                        obj.Message.edit("Role configured!");
                    else obj.Message.edit("Failed to configure roles...! (Failed to set data)");
                });
            } else {
                obj.Message.edit("Failed to reset role...! (Mute is empty)");
            }      
        } else {
            obj.Message.edit("Failed to reset role...! (Mute is empty)");
        }
    });

    conf.send(msg.channel, "Are you sure you want to reset mute role?");
}, {
    name: "Reset mute role",
    desc: "Reset mute role",
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

roles.addChild(rolesUser);
roles.addChild(rolesAssign);
rolesUser.addChild(rolesUserAdd);
rolesUser.addChild(rolesUserRemove);
rolesUser.addChild(new AliasNode("rm", rolesUserRemove));
rolesUser.addChild(rolesUserReset);
roles.addChild(roleMute);
roleMute.addChild(roleMuteReset);
/*Logs.addChild(LogsDefault);
Logs.addChild(LogsMessageDelete);
Logs.addChild(LogsUserBanned);
Logs.addChild(LogsUserJoinLeave);
Logs.addChild(LogsUserKicked);
Logs.addChild(LogsUserMuted);
Logs.addChild(LogsUserWarn);*/

module.exports = (client) => { 
    client.registerNode(roles, "@");
};