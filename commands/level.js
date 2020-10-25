const {Nodes: {CommandNode, AliasNode}} = require("framecord"),
    {GuildUser, User} = require("../classes/User"),
    {MessageAttachment} = require("discord.js");

const LevelComm = new CommandNode("level", async (cli, command, msg) => {
    const mention = msg.guild ? msg.mentions.members.first() : null;
    let user = msg.author;
    if(mention) user = mention.user;
    if(msg.guild) msg.channel.send(null, new MessageAttachment(await (await GuildUser.fetch(user.id, msg.guild.id)).generateLevel(msg.guild.name, msg.guild.iconURL({format: "png"}))));
    else msg.channel.send(null, new MessageAttachment(await (await User.fetch(user.id)).generateLevel()));
}, {
    desc: "Get your or another person's level",
    args: [{type: "user", name: "target"}]
});

const LevelGlobalComm = new CommandNode("global", async (cli, command, msg) => {
    const mention = msg.guild ? msg.mentions.members.first() : null;
    let user = msg.author;
    if(mention) user = mention.user;
    msg.channel.send(null, new MessageAttachment(await (await User.fetch(user.id)).generateLevel()));
}, {
    desc: "Get your or another person's global level",
    args: [{type: "user", name: "target"}]
});

LevelComm.addChild(LevelGlobalComm);
LevelComm.addChild(new AliasNode("g", LevelGlobalComm));

module.exports = (client) => {
    client.registerNode(LevelComm, "!");
};