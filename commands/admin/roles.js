const {Nodes: {CommandNode, AliasNode}, ConfirmationMessage} = require("framecord"),
    {Permissions: {FLAGS}} = require("discord.js"),
    {Roles, UserRoles, RolesRequired} = require("../../rework/DBMain"),
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
            await RolesRequired.del({role_target: command.Args[0].ID});
            const dbRemQuerry = await Roles.del(command.Args[0].ID);

            if(dbRemQuerry)
                obj.Message.edit("Roles configured!");
            else obj.Message.edit("Failed to configure roles...! (Failed to set data)");
        }
    });

    conf.send(msg.channel, `Are you sure you want to ${add ? "add" : "remove"} role \`${role.name}\` ${add ? "to" : "from"} user roles?`);
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

const rolesUserRequire = new CommandNode("require", async (cli, command, msg) => {
    const roles = await RolesRequired.get({role_target: command.Args[0].ID}, undefined, true);
    
    if(roles.success) {
        const target = msg.mentions.roles.first();

        let groups = new Map();
        roles.data.forEach(v => {
            let group = groups.get(v.role_group);
            if(!group) group = v.role_name;
            else group += `, ${v.role_name}`;
            groups.set(v.role_group, group);
        });

        msg.channel.send(`\`\`\`md
# ${target.name}'s Requirements
${[...groups.entries()].map(v => {return `* Group ${v[0]}: ${v[1]}`;}).join("\n")}
\`\`\``);
    } else {
        msg.channel.send("This role requires nothing!");
    }
}, {
    name: "See required role",
    desc: "See what roles are required for a given role",
    args: [{name: "Target", type: "role", optional: false}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const rolesUserRequireAdd = new CommandNode("add", async (cli, command, msg) => {
    const roleCheck = await RolesRequired.get({role_target: command.Args[0].ID, role_required: command.Args[1].ID});
    
    if(roleCheck.success) {
        msg.channel.send("Role already assigned!");
        return;
    }

    const target = await msg.guild.roles.fetch(command.Args[0].ID);
    const role = await msg.guild.roles.fetch(command.Args[1].ID);

    const raMsg = new ConfirmationMessage(msg.author.id, async (obj, reaction, user, deleted) => {
        const dbQuery = await RolesRequired.insert({
            role_target: command.Args[0].ID,
            role_required: command.Args[1].ID,
            role_name: role.name,
            role_group: command.Args[2] ? command.Args[2].Value : 1
        }, ["role_target", "role_required"]);

        if(dbQuery.success) obj.Message.channel.send(`Role \`${role.name}\` was assigned!`);
        else obj.Message.channel.send("Role failed to assign!");
    });
    raMsg.send(msg.channel, `Are you sure you want to assign the role \`${role.name}\` to group \`${command.Args[2] ? command.Args[2].Value : "1"}\` within \`${target.name}\`?`);
}, {
    name: "Add required role",
    desc: "Require a user have defined roles before havin access to a user role",
    args: [{name: "Target", type: "role", optional: false}, {name: "Role", type: "role", optional: false}, {name: "Group", type: "number", optional: true}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const rolesUserRequireRemove = new CommandNode("remove", async (cli, command, msg) => {
    const roleCheck = await RolesRequired.get({role_target: command.Args[0].ID, role_required: command.Args[1].ID});
    
    if(!roleCheck.success) {
        msg.channel.send("Role not assigned!");
        return;
    }

    const target = await msg.guild.roles.fetch(command.Args[0].ID);
    const role = await msg.guild.roles.fetch(command.Args[1].ID);

    const raMsg = new ConfirmationMessage(msg.author.id, async (obj, reaction, user, deleted) => {
        const dbQuery = await RolesRequired.del({role_target: command.Args[0].ID, role_required: command.Args[1].ID});

        if(dbQuery) obj.Message.channel.send(`Role \`${role.name}\` was removed!`);
        else obj.Message.channel.send("Role failed to remove!");
    });
    raMsg.send(msg.channel, `Are you sure you want to remove the role \`${role.name}\` as a requirement for \`${target.name}\`?`);
}, {
    name: "Remove required role",
    desc: "Remove a required role from a target role",
    args: [{name: "Target", type: "role", optional: false}, {name: "Role", type: "role", optional: false}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const rolesUserRequireReset = new CommandNode("reset", async (cli, command, msg) => {
    const roleCheck = command.Args[1] ? await RolesRequired.get({role_target: command.Args[0].ID, role_group: command.Args[1].Value}) : await RolesRequired.get({role_target: command.Args[0].ID});
    
    if(!roleCheck.success) {
        msg.channel.send("No roles assigned!");
        return;
    }

    const role = await msg.guild.roles.fetch(command.Args[0].ID);

    const raMsg = new ConfirmationMessage(msg.author.id, async (obj, reaction, user, deleted) => {
        const dbQuery = command.Args[1] ?  await RolesRequired.del({role_target: command.Args[0].ID, role_group: command.Args[1].Value}) : await RolesRequired.del({role_target: command.Args[0].ID});

        if(dbQuery) obj.Message.channel.send(`Role \`${role.name}\`'s ${command.Args[1] ? "group " + command.Args[1].Value : ""}requirements were reset!`);
        else obj.Message.channel.send("Role failed to reset!");
    });
    raMsg.send(msg.channel, `Are you sure you want to reset the requirements for ${command.Args[1] ? "group `" + command.Args[1].Value + "` of " : ""}\`${role.name}\`?`);
}, {
    name: "Reset required roles",
    desc: "Reset all required roles from a target role, can specify only a group",
    args: [{name: "Target", type: "role", optional: false}, {name: "Group", type: "number", optional: true}],
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
            await RolesRequired.del({role_target: command.Args[0].ID});
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
    
        conf.send(msg.channel, `Are you sure you want to set role \`${role.name}\` to mute role?`);
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
rolesUser.addChild(rolesUserRequire);
rolesUser.addChild(new AliasNode("req", rolesUserRequire));
rolesUserRequire.addChild(rolesUserRequireAdd);
rolesUserRequire.addChild(rolesUserRequireRemove);
rolesUserRequire.addChild(new AliasNode("rm", rolesUserRequireRemove));
rolesUserRequire.addChild(rolesUserRequireReset);
rolesUser.addChild(new AliasNode("rm", rolesUserRemove));
rolesUser.addChild(rolesUserReset);
roles.addChild(roleMute);
roleMute.addChild(roleMuteReset);

module.exports = (client) => { 
    client.registerNode(roles, "@");
};