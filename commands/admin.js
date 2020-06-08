const {Nodes: {CommandNode, AliasNode}, ConfirmationMessage} = require("framecord"),
    {Permissions: {FLAGS}} = require("discord.js"),
    {Kicked} = require("../controllers/cache"),
    {roles} = require("../controllers/dbMain"),
    {LogEvent, EVENTS, PRIORITIES} = require("../controllers/discordLogger");

const Ban = new CommandNode("ban", (cli, command, msg) => {
    const mention = msg.mentions.members.first();
    const user = mention.user;

    if(command.Args[2] && command.Args[2].Value > 7) {
        msg.reply("Amount of days banned needs to be 7 or less");
        return;
    } 
    
    let banMsg = new ConfirmationMessage(msg.author.id, (obj) => {
        mention.ban({days: command.Args[2] ? command.Args[2].Value : 0, reason: `[Enforcer: ${msg.member.displayName}] ${command.Args[1] && command.Args[1].Type === "string" ? command.Args[1].Value : ""}`})
        .then(() => {
            obj.Message.channel.send("**User has been banned!**");
            user.send(`You have been banned from **${msg.guild.name}**${command.Args[2] ? " for " + command.Args[2].Value + " days" : " permanently"}${command.Args[1] && command.Args[1].Type === "string" ? " for the following reason: " + command.Args[1].toCode(true) : ""}`);
        }).catch(err => {
            obj.Message.channel.send(`Error attempting to ban: \`${err.message}\``);
        });
    });

    banMsg.send(msg.channel, `**Ban user ** ${mention.displayName}${command.Args[2] ? " **for** *" + command.Args[2].Value + "* **days**" : ""}?${command.Args[1] && command.Args[1].Type === "string" ? command.Args[1].toCode(true) : ""}`);
}, {
    desc: "Ban a user",
    args: [{name: "User", type: "user", optional: false}, "Reason", {name: "Days", type: "number"}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, FLAGS.BAN_MEMBERS]
});

const Kick = new CommandNode("kick", (cli, command, msg) => {
    const mention = msg.mentions.members.first();
    const user = mention.user;
    
    let kickMsg = new ConfirmationMessage(msg.author.id, (obj) => {
        Kicked.set(mention.id, {reason: command.Args[1] && command.Args[1].Type === "string" ? command.Args[1].Value : "", enforcer: msg.author.tag});
        mention.kick(`[Enforcer: ${msg.member.displayName}] ${command.Args[1] && command.Args[1].Type === "string" ? command.Args[1].Value : ""}`)
        .then(() => {
            obj.Message.channel.send("**User has been kicked!**");
            user.send(`You have been kicked from **${msg.guild.name}**${command.Args[1] && command.Args[1].Type === "string" ? " for the following reason: " + command.Args[1].toCode(true) : ""}`);
        }).catch(err => {
            obj.Message.channel.send(`Error attempting to kick: \`${err.message}\``);
        });
    });

    kickMsg.send(msg.channel, `**Kick user ** ${mention.displayName}?${command.Args[1] && command.Args[1].Type === "string" ? command.Args[1].toCode(true) : ""}`);
}, {
    desc: "Kick a user",
    args: [{name: "User", type: "user", optional: false}, "Reason"],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, FLAGS.KICK_MEMBERS]
});

const Mute = new CommandNode("mute", (cli, command, msg) => {
    const mention = msg.mentions.members.first();
    const user = mention.user;

    roles.getValue(msg.guild.id, roles.ROLE_TYPES.MUTE_ROLE).then(val => {
        if(val.success && val.roles.length) {
            let muteMsg = new ConfirmationMessage(msg.author.id, (obj) => {
                mention.roles.add(val.roles[0], `[Enforcer: ${msg.member.displayName}] ${command.Args[1] ? command.Args[1].Value : ""}`)
                .then(() => {
                    obj.Message.channel.send("**User has been muted!**");
                    user.send(`You have been muted in **${msg.guild.name}**${command.Args[1] ? " for the following reason: " + command.Args[1].toCode(true) : ""}`);
                    if(command.Args[1])
                        LogEvent(msg.guild, {desc: `\`${mention.user.tag}\` was muted by \`${msg.author.tag}\``, fields: [{name: "Target", value: mention.user.tag}, {name: "Enforcer", value: msg.author.tag}, {name: "Reason", value: command.Args[1].Value}]}, EVENTS.MUTED, PRIORITIES.MEDIUM);
                    else LogEvent(msg.guild, {desc: `\`${mention.user.tag}\` was muted by \`${msg.author.tag}\``, fields: [{name: "Target", value: mention.user.tag}, {name: "Enforcer", value: msg.author.tag}]}, EVENTS.MUTED, PRIORITIES.MEDIUM);
                }).catch(err => {
                    obj.Message.channel.send(`Error attempting to mute: \`${err.message}\``);
                });
            });
        
            muteMsg.send(msg.channel, `**Mute user ** \`${mention.displayName}\`?${command.Args[1] ? " For reason:" + command.Args[1].toCode(true) : ""}`);
        } else {
            msg.reply("An admin must set a mute role!");
        }
        
    });
    
    
}, {
    desc: "Mute a user",
    args: [{name: "User", type: "user", optional: false}, {name: "Reason", type: "string"}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, FLAGS.MANAGE_ROLES]
});

const Unmute = new CommandNode("unmute", (cli, command, msg) => {
    const mention = msg.mentions.members.first();
    const user = mention.user;

    roles.getValue(msg.guild.id, roles.ROLE_TYPES.MUTE_ROLE).then(val => {
        if(val.success && val.roles.length) {
            let unmuteMsg = new ConfirmationMessage(msg.author.id, (obj) => {
                mention.roles.remove(val.roles[0], `[Enforcer: ${msg.member.displayName}] ${command.Args[1] ? command.Args[1].Value : ""}`)
                .then(() => {
                    obj.Message.channel.send("**User has been unmuted!**");
                    user.send(`You have been unmuted in **${msg.guild.name}**${command.Args[1] ? " for the following reason: " + command.Args[1].toCode(true) : ""}`);
                    if(command.Args[1])
                        LogEvent(msg.guild, {desc: `\`${mention.user.tag}\` was unmuted by \`${msg.author.tag}\``, fields: [{name: "Target", value: mention.user.tag}, {name: "Enforcer", value: msg.author.tag}, {name: "Reason", value: command.Args[1].Value}]}, EVENTS.UNMUTED, PRIORITIES.MEDIUM);
                    else LogEvent(msg.guild, {desc: `\`${mention.user.tag}\` was unmuted by \`${msg.author.tag}\``, fields: [{name: "Target", value: mention.user.tag}, {name: "Enforcer", value: msg.author.tag}]}, EVENTS.UNMUTED, PRIORITIES.MEDIUM);
                }).catch(err => {
                    obj.Message.channel.send(`Error attempting to unmute: \`${err.message}\``);
                });
            });
        
            unmuteMsg.send(msg.channel, `**Unmute user ** \`${mention.displayName}\`?${command.Args[1] ? " For reason:" + command.Args[1].toCode(true) : ""}`);
        } else {
            msg.reply("An admin must set a mute role!");
        }
        
    });
}, {
    desc: "Unmute a user",
    args: [{name: "User", type: "user", optional: false}, {name: "Reason", type: "string"}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, FLAGS.MANAGE_ROLES]
});

module.exports = (client) => { 
    client.registerNode(Ban, "@");
    client.registerNode(Kick, "@");
    client.registerNode(Mute, "@");
    client.registerNode(Unmute, "@");
};