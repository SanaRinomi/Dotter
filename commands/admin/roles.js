const {Nodes: {CommandNode, AliasNode}, ConfirmationMessage} = require("framecord"),
    {Permissions: {FLAGS}} = require("discord.js"),
    {Roles, UserRoles} = require("../../rework/DBMain"),
    {ROLE_TYPES} = require("../../controllers/constants");

async function userRoleManager(command, msg, add = true) {
    const role = msg.mentions.roles.first();

    let conf = new ConfirmationMessage(msg.author.id, async (obj) => {
        if(add) {
            const dbAddQuerry = await Roles.upsert(command.Args[0].ID, {
                guild_id: msg.guild.id,
                name: role.name,
                role_type: ROLE_TYPES.USER_ROLES
            });

            if(dbAddQuerry.success)
                obj.Message.edit("Roles configured!");
            else obj.Message.edit("Failed to configure roles...! (Failed to set data)");
        } else {
            await UserRoles.removeAllLinked("dot_users", command.Args[0].ID);
            const dbRemQuerry = await Roles.del(command.Args[0].ID);

            if(dbRemQuerry)
                obj.Message.edit("Roles configured!");
            else obj.Message.edit("Failed to configure roles...! (Failed to set data)");
        }
    });

    conf.send(msg.channel, `Are you sure you want to ${add ? "add" : "remove"} role ${role.name} ${add ? "to" : "from"} user roles?`);
}

const roles = new CommandNode("roles", async (cli, command, msg) => {
    const roles = await Roles.get({guild_id: msg.guild.id}, undefined, true);

    if(roles.success){
        const muted = roles.data.filter(v => v.role_type === ROLE_TYPES.MUTE_ROLE);
        const user = roles.data.filter(v => v.role_type === ROLE_TYPES.USER_ROLES);

        msg.channel.send(`\`\`\`md
# Role Settings
* Muted: ${muted && muted[0] ? muted[0].name : "Nothing"}
* User Roles: ${user && user[0] ? user.map(v => { return v.name; }).join(", ") : "Nothing"}
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
    const roles = await Roles.get({guild_id: msg.guild.id, role_type: ROLE_TYPES.USER_ROLES}, undefined, true);

    if(roles.success){
        msg.channel.send(`\`\`\`md
# User Roles Settings
* Roles: ${roles.data[0] ? roles.data.map(v => { return v.name; }).join(", ") : "Nothing"}
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
    let conf = new ConfirmationMessage(msg.author.id, async (obj) => {
        const dbAllRoles = await Roles.get({guild_id: msg.guild.id, role_type: ROLE_TYPES.USER_ROLES}, undefined, true);
        if(!dbAllRoles.success) {
            obj.Message.edit("Failed to reset roles...! (List is empty)");
            return;
        }

        const ids = Promise.all(dbAllRoles.data.map(async v => {
            await UserRoles.removeAllLinked("dot_users", v.id);
            return v.id;
        }));

        const removedRoles = Roles.del(ids);
        if(removedRoles)
            obj.Message.edit("Roles configured!");
        else obj.Message.edit("Failed to configure roles...! (Failed to set data)");
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

        let conf = new ConfirmationMessage(msg.author.id, async (obj) => {
            const oldMuteRole = await Roles.get({guild_id: msg.guild.id, role_type: ROLE_TYPES.MUTE_ROLE});
            const dbRes = await Roles.upsert(command.Args[0].ID, {
                guild_id: msg.guild.id,
                name: role.name,
                role_type: ROLE_TYPES.MUTE_ROLE
            });

            if(dbRes.success && oldMuteRole.success) {
                await UserRoles.upsert({role_id: oldMuteRole.data.id}, {role_id: command.Args[0].ID}, true);
                await Roles.del(oldMuteRole.data.id);
            }

            if(dbRes.success)
                obj.Message.edit("Role configured!");
            else obj.Message.edit("Failed to configure role...! (Failed to set data)");
        });
    
        conf.send(msg.channel, `Are you sure you want to set role ${role.name} to mute role?`);
    } else {
        const roles = await Roles.get({guild_id: msg.guild.id, role_type: ROLE_TYPES.MUTE_ROLE});

        if(roles.success){
            msg.channel.send(`\`\`\`md
# Mute Role Settings
* Role: ${roles.data ? roles.data.name : "Nothing"}
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
    const muteRole = await Roles.get({guild_id: msg.guild.id, role_type: ROLE_TYPES.MUTE_ROLE});

    if(!muteRole.success) {
        msg.reply("No roles to reset!");
        return;
    }

    let conf = new ConfirmationMessage(msg.author.id, async (obj) => {
        await UserRoles.removeAllLinked("dot_users", muteRole.data.id);

        const dbRes = await Roles.del(muteRole.data.id);
        if(dbRes)
            obj.Message.edit("Role configured!");
        else obj.Message.edit("Failed to configure roles...! (Failed to set data)");
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

module.exports = (client) => { 
    client.registerNode(roles, "@");
};