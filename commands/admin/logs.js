const {Nodes: {CommandNode, AliasNode}, ConfirmationMessage} = require("framecord"),
    {Permissions: {FLAGS}} = require("discord.js"),
    DB = require("../../controllers/dbMain");

function channelSet(command, msg, name, value) {
    value = value ? value : name;
    let channel = msg.channel;
    if(command.Args[0])
        channel = msg.mentions.channels.first();

    let conf = new ConfirmationMessage(msg.author.id, async (obj) => {
        await DB.guild.addGuild(msg.guild.id);

            const logVal = await DB.guild.getLogs(msg.guild.id);

            if(logVal.success) {
                let logJSON = logVal.logs ? logVal.logs : {};

                logJSON[value] = channel.id === logJSON.default ? null : channel.id;

                DB.guild.updateLogs(msg.guild.id, logJSON).then(v => {
                    if(v)
                    obj.Message.edit("Logs configured!");
                    else obj.Message.edit("Failed to configure logs...! (Failed to set data)");
                });
            } else 
                obj.Message.edit("Failed to configure logs...! (Failed to retrieve data)");
    });

    conf.send(msg.channel, `Are you sure you want to set the ${name} log channel to \`${channel.name}\`?`);
}

const Logs = new CommandNode("logs", async (cli, command, msg) => {
    if(command.Args[0]) {
        let conf = new ConfirmationMessage(msg.author.id, async (obj) => {
            await DB.guild.addGuild(msg.guild.id);

            const logVal = await DB.guild.getLogs(msg.guild.id);

            if(logVal.success) {
                let logJSON = logVal.logs ? logVal.logs : {};

                if(command.Args[0].Value) {
                    logJSON.enabled = true;
                    logJSON.default = logJSON.default ? logJSON.default : msg.channel.id;
                } else logJSON.enabled = false;

                DB.guild.updateLogs(msg.guild.id, logJSON).then(v => {
                    if(v)
                    obj.Message.edit("Logs configured!");
                    else obj.Message.edit("Failed to configure logs...! (Failed to set data)");
                });
            } else 
                obj.Message.edit("Failed to configure logs...! (Failed to retrieve data)");    
        });

        conf.send(msg.channel, `Are you sure you want to ${command.Args[0].Value ? "enable" : "disable"} logs?`);
    } else {
        await DB.guild.addGuild(msg.guild.id);
        let logData = await DB.guild.getLogs(msg.guild.id);

        if(logData.success)
            msg.channel.send(`\`\`\`md
#Log Settings
* Enabled: ${logData.logs.enabled ? "Yes" : "No"}
* Default Log Channel: ${logData.logs.default ? msg.guild.channels.cache.get(logData.logs.default).name : "Nothing"}${logData.logs.ujoinleave ? "\n* Join and Leave Log Channel: "+msg.guild.channels.cache.get(logData.logs.ujoinleave).name : ""}${logData.logs.ukicked ? "\n* Kicked Log Channel: "+msg.guild.channels.cache.get(logData.logs.ukicked).name : ""}${logData.logs.ubanned ? "\n* Banned Log Channel: "+msg.guild.channels.cache.get(logData.logs.ubanned).name : ""}${logData.logs.mdeleted ? "\n* Message Delete Log Channel: "+msg.guild.channels.cache.get(logData.logs.mdeleted).name : ""}${logData.logs.umuted ? "\n* Muted Log Channel: "+msg.guild.channels.cache.get(logData.logs.umuted).name : ""}${logData.logs.uwarned ? "\n* Warned Log Channel: "+msg.guild.channels.cache.get(logData.logs.uwarned).name : ""}  
\`\`\``);
        else msg.channel.send("Failed to get any data...!");
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
    args: [{name: "Channel", type: "string"}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const LogsUserJoinLeave = new CommandNode("joinleave", async (cli, command, msg) => {
    channelSet(command, msg, "user join and leave", "ujoinleave");
}, {
    name: "Join and Leave Channel",
    desc: "Set the join and leave log channel",
    args: [{name: "Channel", type: "string"}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const LogsUserKicked = new CommandNode("kicked", async (cli, command, msg) => {
    channelSet(command, msg, "user kick", "ukicked");
}, {
    name: "Kick Channel",
    desc: "Set the user kick log channel",
    args: [{name: "Channel", type: "string"}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const LogsUserBanned = new CommandNode("banned", async (cli, command, msg) => {
    channelSet(command, msg, "user ban", "ubanned");
}, {
    name: "Ban Channel",
    desc: "Set the user ban log channel",
    args: [{name: "Channel", type: "string"}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const LogsMessageDelete = new CommandNode("delete", async (cli, command, msg) => {
    channelSet(command, msg, "message delete", "mdeleted");
}, {
    name: "Message Delete Channel",
    desc: "Set the message delete log channel",
    args: [{name: "Channel", type: "string"}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const LogsUserMuted = new CommandNode("muted", async (cli, command, msg) => {
    channelSet(command, msg, "user mute", "umuted");
}, {
    name: "Mute Channel",
    desc: "Set the muted log channel",
    args: [{name: "Channel", type: "string"}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const LogsUserWarn = new CommandNode("warn", async (cli, command, msg) => {
    channelSet(command, msg, "user warn", "uwarned");
}, {
    name: "Warn Channel",
    desc: "Set the user warn log channel",
    args: [{name: "Channel", type: "string"}],
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