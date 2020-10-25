const {Nodes: {CommandNode, AliasNode}, ConfirmationMessage} = require("framecord"),
    {Permissions: {FLAGS}} = require("discord.js"),
    {Kicked, Banned, Muted} = require("../controllers/cache"),
    {roles, logs, timed} = require("../controllers/dbMain"),
    {LogEvent} = require("../controllers/discordLogger"),
    {EVENTS, PRIORITIES, ROLE_TYPES} = require("../controllers/constants");
const constants = require("../controllers/constants");

const Ban = new CommandNode("ban", (cli, command, msg) => {
    const mention = msg.mentions.members.first();
    const user = mention.user;
    let time; 

    if(command.Args[2]) {
        if(timed.IsValidTime(command.Args[2].Value))
            time = timed.StringToTime(command.Args[2].Value);
        else {
            msg.reply(`${command.Args[2].Value} isn't a valid time, it has to be something like "1 hour and 30 minutes" **with quotations**.`);
            return;
        }
    }

    let banMsg = new ConfirmationMessage(msg.author.id, (obj) => {
        Banned.set(mention.id, {reason: command.Args[1] && command.Args[1].Type === "string" ? command.Args[1].Value : "", enforcer: msg.author.tag, enforcerID: msg.author.id, target: {id: mention.user.id, tag: mention.user.tag}, time});
        mention.ban({reason: `[Enforcer: ${msg.member.displayName}] ${command.Args[1] && command.Args[1].Type === "string" ? command.Args[1].Value : ""}`})
        .then(() => {
            if(time) timed.addTimedEvent(user.id, msg.guild.id, constants.TIMED_EVENTS.BAN_LIMIT, time.value.end.toISOString(), {reason: command.Args[1] && command.Args[1].Type === "string" ? command.Args[1].Value : "", enforcer: msg.author.tag, enforcerID: msg.author.id, target: user.tag});
            obj.Message.channel.send("**User has been banned!**");
            user.send(`You have been banned from **${msg.guild.name}**${time ? " for " + time.value.end.fromNow(true) : " permanently"}${command.Args[1] && command.Args[1].Type === "string" ? " for the following reason: " + command.Args[1].toCode(true) : ""}`);
        }).catch(err => {
            Banned.delete(mention.id);
            obj.Message.channel.send(`Error attempting to ban: \`${err.message}\``);
        });
    });

    banMsg.send(msg.channel, `**Ban user ** ${mention.displayName}${command.Args[2] ? " **for** " + command.Args[2].Value : ""}?${command.Args[1] && command.Args[1].Type === "string" ? command.Args[1].toCode(true) : ""}`);
}, {
    desc: "Ban a user",
    args: [{name: "User", type: "user", optional: false}, {name: "Reason", type: "string"}, {name: "Time", type: "string"}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, FLAGS.BAN_MEMBERS]
});

const Kick = new CommandNode("kick", (cli, command, msg) => {
    const mention = msg.mentions.members.first();
    const user = mention.user;
    
    let kickMsg = new ConfirmationMessage(msg.author.id, (obj) => {
        Kicked.set(mention.id, {reason: command.Args[1] && command.Args[1].Type === "string" ? command.Args[1].Value : "", enforcer: msg.author.tag, enforcerID: msg.author.id});
        mention.kick(`[Enforcer: ${msg.member.displayName}] ${command.Args[1] && command.Args[1].Type === "string" ? command.Args[1].Value : ""}`)
        .then(() => {
            obj.Message.channel.send("**User has been kicked!**");
            user.send(`You have been kicked from **${msg.guild.name}**${command.Args[1] && command.Args[1].Type === "string" ? " for the following reason: " + command.Args[1].toCode(true) : ""}`);
        }).catch(err => {
            Kicked.delete(mention.id);
            obj.Message.channel.send(`Error attempting to kick: \`${err.message}\``);
        });
    });

    kickMsg.send(msg.channel, `**Kick user ** ${mention.displayName}?${command.Args[1] && command.Args[1].Type === "string" ? command.Args[1].toCode(true) : ""}`);
}, {
    desc: "Kick a user",
    args: [{name: "User", type: "user", optional: false}, {name: "Reason", type: "string"}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, FLAGS.KICK_MEMBERS]
});

const Mute = new CommandNode("mute", (cli, command, msg) => {
    const mention = msg.mentions.members.first();
    const user = mention.user;
    let time; 

    if(command.Args[2]) {
        if(timed.IsValidTime(command.Args[2].Value))
            time = timed.StringToTime(command.Args[2].Value);
        else {
            msg.reply(`${command.Args[2].Value} isn't a valid time, it has to be something like "1 hour and 30 minutes" **with quotations**.`);
            return;
        }
    }

    roles.getValue(msg.guild.id, ROLE_TYPES.MUTE_ROLE).then(val => {
        if(val.success && val.roles.length) {
            let muteMsg = new ConfirmationMessage(msg.author.id, (obj) => {
                Muted.set(mention.id, {reason: command.Args[1] && command.Args[1].Type === "string" ? command.Args[1].Value : "", enforcer: msg.author.tag, enforcerID: msg.author.id, target: {id: mention.user.id, tag: mention.user.tag}, time});
                mention.roles.add(val.roles[0], `[Muting User][Enforcer: ${msg.member.displayName}] ${command.Args[1] && command.Args[1].Type === "string"  ? command.Args[1].Value : ""}`)
                .then(() => {
                    obj.Message.channel.send("**User has been muted!**");
                    if(time) timed.addTimedEvent(user.id, msg.guild.id, constants.TIMED_EVENTS.MUTE_LIMIT, time.value.end.toISOString(), {reason: command.Args[1] && command.Args[1].Type === "string"  ? command.Args[1].Value : "", enforcer: msg.author.tag, enforcerID: msg.author.id, target: user.tag});
                    user.send(`You have been muted in **${msg.guild.name}**${time ? " for " + time.value.end.fromNow(true) : ""}${command.Args[1] && command.Args[1].Type === "string"  ? " for the following reason: " + command.Args[1].toCode(true) : ""}`);
                    logs.addEvent(user.id, msg.guild.id, EVENTS.MUTED, msg.author.id, command.Args[1] && command.Args[1].Type === "string"  ? command.Args[1].Value : null);

                    let fields = [];
                    fields.push({name: "Target", value: `\`${mention.user.tag}\` (ID: \`${mention.user.id}\`)`});
                    fields.push({name: "Enforcer", value: msg.author.tag});
                    if(command.Args[1] && command.Args[1].Type === "string" ) fields.push({name: "Reason", value: command.Args[1].Value});
                    if(time) fields.push({name: "Time", value: `${time.value.end.fromNow(true)} (${time.value.end.format("DD MMM YYYY, HH:mm Z")})`});
                    LogEvent(mention.user.id,msg.guild, {desc: `\`${mention.user.tag}\` was muted.`, fields}, EVENTS.MUTED, PRIORITIES.MEDIUM);
                }).catch(err => {
                    obj.Message.channel.send(`Error attempting to mute: \`${err.message}\``);
                });
            });
        
            muteMsg.send(msg.channel, `**Mute user ** \`${mention.displayName}\`?${command.Args[1] && command.Args[1].Type === "string" ? " For reason:" + command.Args[1].toCode(true) : ""}`);
        } else {
            msg.reply("An admin must set a mute role!");
        }
        
    });
    
    
}, {
    desc: "Mute a user",
    args: [{name: "User", type: "user", optional: false}, {name: "Reason", type: "string"}, {name: "Time", type: "string"}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, FLAGS.MANAGE_ROLES]
});

const Unmute = new CommandNode("unmute", (cli, command, msg) => {
    const mention = msg.mentions.members.first();
    const user = mention.user;

    roles.getValue(msg.guild.id, ROLE_TYPES.MUTE_ROLE).then(val => {
        if(val.success && val.roles.length) {
            let unmuteMsg = new ConfirmationMessage(msg.author.id, (obj) => {
                mention.roles.remove(val.roles[0], `[Enforcer: ${msg.member.displayName}] ${command.Args[1] ? command.Args[1].Value : ""}`)
                .then(() => {
                    obj.Message.channel.send("**User has been unmuted!**");
                    user.send(`You have been unmuted in **${msg.guild.name}**${command.Args[1] ? " for the following reason: " + command.Args[1].toCode(true) : ""}`);
                    logs.addEvent(user.id, msg.guild.id, EVENTS.UNMUTED, msg.author.id, command.Args[1] ? command.Args[1].Value : null);
                    if(command.Args[1])
                        LogEvent(user.id,msg.guild, {desc: `\`${mention.user.tag}\` was unmuted by \`${msg.author.tag}\``, fields: [{name: "Target", value: `\`${mention.user.tag}\` (ID: \`${mention.user.id}\`)`}, {name: "Enforcer", value: msg.author.tag}, {name: "Reason", value: command.Args[1].Value}]}, EVENTS.UNMUTED, PRIORITIES.MEDIUM);
                    else LogEvent(user.id, msg.guild, {desc: `\`${mention.user.tag}\` was unmuted by \`${msg.author.tag}\``, fields: [{name: "Target", value: `\`${mention.user.tag}\` (ID: \`${mention.user.id}\`)`}, {name: "Enforcer", value: msg.author.tag}]}, EVENTS.UNMUTED, PRIORITIES.MEDIUM);
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