const {Nodes: {CommandNode, AliasNode}, ConfirmationMessage} = require("framecord"),
    {Permissions: {FLAGS}} = require("discord.js"),
    {GuildConfig} = require("../../classes/Guild");

function channelSet(command, msg, name, value) {
    value = value ? value : name;
    let channel = msg.channel;
    if(command.Args[0])
        channel = msg.mentions.channels.first();

    let conf = new ConfirmationMessage(msg.author.id, async (obj) => {
        const config = await GuildConfig.fetch(msg.guild.id);
        if(config) {
            let json = {};
            json[value] = channel.id === config.Logs.default ? null : channel.id;
            config.Logs = json;
            config.save().then(v => {
                if(v.success) obj.Message.edit("Logs configured!");
                else obj.Message.edit("Failed to configure logs...! (Failed to set data)");
            });

        } else obj.Message.edit("Failed to configure logs...! (Failed to retrieve data)");           
    });

    conf.send(msg.channel, `Are you sure you want to set the ${name} log channel to \`${channel.name}\`?`);
}

const Logs = new CommandNode("logs", async (cli, command, msg) => {
    const config = await GuildConfig.fetch(msg.guild.id);
    if(!config) {
        msg.channel.send("Failed to get retrieve guild configs...!");
        return;
    }

    if(command.Args[0]) {
        let conf = new ConfirmationMessage(msg.author.id, async (obj) => {
            if(command.Args[0].Value)
                config.Logs = {enabled: true, default: channel.id};
            else config.Logs = {enabled: false};

            config.save().then(v => {
                if(v.success) obj.Message.edit("Logs configured!");
                else obj.Message.edit("Failed to configure logs...! (Failed to set data)");
            });
        });

        conf.send(msg.channel, `Are you sure you want to ${command.Args[0].Value ? "enable" : "disable"} logs?`);
    } else {
            msg.channel.send(`\`\`\`md
# Log Settings
* Enabled: ${config.Logs.enabled ? "Yes" : "No"}
* Default Log Channel: ${config.Logs.default ? msg.guild.channels.cache.get(config.Logs.default).name : "Nothing"}${config.Logs.ujoinleave ? "\n* Join and Leave Log Channel: "+msg.guild.channels.cache.get(config.Logs.ujoinleave).name : ""}${config.Logs.ukicked ? "\n* Kicked Log Channel: "+msg.guild.channels.cache.get(config.Logs.ukicked).name : ""}${config.Logs.ubanned ? "\n* Banned Log Channel: "+msg.guild.channels.cache.get(config.Logs.ubanned).name : ""}${config.Logs.mdeleted ? "\n* Message Delete Log Channel: "+msg.guild.channels.cache.get(config.Logs.mdeleted).name : ""}${config.Logs.umuted ? "\n* Muted Log Channel: "+msg.guild.channels.cache.get(config.Logs.umuted).name : ""}${config.Logs.uwarned ? "\n* Warned Log Channel: "+msg.guild.channels.cache.get(config.Logs.uwarned).name : ""}  
\`\`\``);
    }
}, {
    name: "Bot Logs",
    desc: "Get the logs, enable with no previously selected channels, will set log channel to the channel where it was executed",
    args: [{name: "Enable", type: "boolean"}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const LogsDefault = new CommandNode("default", async (cli, command, msg) => {
    channelSet(command, msg, "default");
}, {
    name: "Default Channel",
    desc: "Set the default log channel",
    args: [{name: "Channel", type: "channel"}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const LogsUserJoinLeave = new CommandNode("joinleave", async (cli, command, msg) => {
    channelSet(command, msg, "user join and leave", "ujoinleave");
}, {
    name: "Join and Leave Channel",
    desc: "Set the join and leave log channel",
    args: [{name: "Channel", type: "channel"}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const LogsUserKicked = new CommandNode("kicked", async (cli, command, msg) => {
    channelSet(command, msg, "user kick", "ukicked");
}, {
    name: "Kick Channel",
    desc: "Set the user kick log channel",
    args: [{name: "Channel", type: "channel"}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const LogsUserBanned = new CommandNode("banned", async (cli, command, msg) => {
    channelSet(command, msg, "user ban", "ubanned");
}, {
    name: "Ban Channel",
    desc: "Set the user ban log channel",
    args: [{name: "Channel", type: "channel"}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const LogsMessageDelete = new CommandNode("delete", async (cli, command, msg) => {
    channelSet(command, msg, "message delete", "mdeleted");
}, {
    name: "Message Delete Channel",
    desc: "Set the message delete log channel",
    args: [{name: "Channel", type: "channel"}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const LogsUserMuted = new CommandNode("muted", async (cli, command, msg) => {
    channelSet(command, msg, "user mute", "umuted");
}, {
    name: "Mute Channel",
    desc: "Set the muted log channel",
    args: [{name: "Channel", type: "channel"}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const LogsUserWarn = new CommandNode("warn", async (cli, command, msg) => {
    channelSet(command, msg, "user warn", "uwarned");
}, {
    name: "Warn Channel",
    desc: "Set the user warn log channel",
    args: [{name: "Channel", type: "channel"}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

Logs.addChild(LogsDefault);
Logs.addChild(LogsMessageDelete);
Logs.addChild(LogsUserBanned);
Logs.addChild(LogsUserJoinLeave);
Logs.addChild(LogsUserKicked);
Logs.addChild(LogsUserMuted);
Logs.addChild(LogsUserWarn);

module.exports = (client) => { 
    client.registerNode(Logs, "@");
};