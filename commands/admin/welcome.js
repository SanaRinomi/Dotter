const {Nodes: {CommandNode, AliasNode}, ConfirmationMessage} = require("framecord"),
    {Permissions: {FLAGS}} = require("discord.js"),
    {GuildConfig} = require("../../classes/Guild");

const Welcome = new CommandNode("welcome", async (cli, command, msg) => {
    let config = await GuildConfig.fetch(msg.guild.id);

    if(config) {
        config = config.Welcome;
        msg.channel.send(`\`\`\`md
# Welcome Settings
* Welcome Channel: ${config.channel ? msg.guild.channels.cache.get(config.channel).name : "Nothing"}        
* Welcome Message: ${config.message ? config.message : "Nothing"}        
\`\`\``);
    }
    else msg.channel.send("Failed to get any data...!");
}, {
    name: "Welcome Message",
    desc: "Get the welcome message",
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS]
});

const welcomeEnable = new CommandNode("enable", (cli, comm, msg) => {
    let conf = new ConfirmationMessage(msg.author.id, async (obj) => {
        let config = await GuildConfig.fetch(msg.guild.id);
        config.Logs = {enabled:comm.Args[0].Value};
        config.save().then(v => {
            if(v.success) obj.Message.edit("Welcome enable set!");
            else obj.Message.edit("Welcome enable failed to set!");
        });
    });
    
    conf.send(msg.channel, `Are you sure you want to ${comm.Args[0] ? "enable" : "disable"} the welcome message?`);
}, {
    name: "Toggle Enabled",
    desc: "Toggle the welcome message.",
    args: [{name: "enabled", type: "boolean", optional: false}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const welcomeImage = new CommandNode("image", (cli, comm, msg) => {
    let conf = new ConfirmationMessage(msg.author.id, async (obj) => {
        let config = await GuildConfig.fetch(msg.guild.id);
        config.Logs = {image:comm.Args[0].Value};
        config.save().then(v => {
            if(v.success) obj.Message.edit("Welcome image set!");
            else obj.Message.edit("Welcome image failed to set!");
        });
    });
    
    conf.send(msg.channel, `Are you sure you want to ${comm.Args[0] ? "enable" : "disable"} the welcome image?`);
}, {
    name: "Toggle Image",
    desc: "Toggle the welcome message auto-generated image.",
    args: [{name: "enabled", type: "boolean", optional: false}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const welcomeMessage = new CommandNode("message", (cli, comm, msg) => {
    let conf = new ConfirmationMessage(msg.author.id, async (obj) => {
        let config = await GuildConfig.fetch(msg.guild.id);
        config.Logs = {message:comm.Args[0].Value};
        config.save().then(v => {
            if(v.success) obj.Message.edit("Welcome message set!");
            else obj.Message.edit("Welcome message failed to set!");
        });
    });
    
    conf.send(msg.channel, `Are you sure you want to set the welcome message to: \`\`\`md\n${comm.Args[0].Value}\n\`\`\``);
}, {
    name: "Set Message",
    desc: "Set welcome message.",
    args: [{name: "message", type: "string", optional: false}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const welcomeChannel = new CommandNode("channel", (cli, comm, msg) => {
    let channel = msg.mentions.channels.first();

    let conf = new ConfirmationMessage(msg.author.id, async (obj) => {
        let config = await GuildConfig.fetch(msg.guild.id);
        config.Logs = {channel: channel.id};
        config.save().then(v => {
            if(v.success) obj.Message.edit("Welcome channel set!");
            else obj.Message.edit("Welcome channel failed to set!");
        });
    });
    
    conf.send(msg.channel, `Are you sure you want to set the welcome channel to \`${channel.name}\`?`);
}, {
    name: "Set Channel",
    desc: "Set welcome channel.",
    args: [{name: "channel", type: "channel", optional: false}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

Welcome.addChild(welcomeMessage);
Welcome.addChild(new AliasNode("msg", welcomeMessage));
Welcome.addChild(welcomeChannel);
Welcome.addChild(new AliasNode("chnl", welcomeChannel));
Welcome.addChild(welcomeEnable);
Welcome.addChild(new AliasNode("state", welcomeEnable));
Welcome.addChild(welcomeImage);
Welcome.addChild(new AliasNode("img", welcomeImage));

module.exports = (client) => { 
    client.registerNode(Welcome, "@");
    client.registerNode(new AliasNode("welc", Welcome), "@");
};