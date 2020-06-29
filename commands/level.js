const {Nodes: {CommandNode, AliasNode}, ListMessage, ReactionMessage, ConfirmationMessage} = require("framecord"),
    Profile = require("../classes/Profile"),
    {LevelGuildTemp, LevelGlobalTemp} = require("../controllers/canv"),
    {MessageAttachment} = require("discord.js");


async function getLevel(id, gname, gurl, gid) {
    const profileData = (await Profile.fetch(id)).toJSON(true);
    
    let global = {
        percentage: Math.round(profileData.leveling.global.reqs.percentage),
        percentageFull: profileData.leveling.global.reqs.percentage,
        currExp: profileData.leveling.global.exp > 1000 ? Math.round(profileData.leveling.global.exp/1000)+"K" : Math.round(profileData.leveling.global.exp),
        req: profileData.leveling.global.reqs.next > 1000 ? Math.round(profileData.leveling.global.reqs.next/1000)+"K" : Math.round(profileData.leveling.global.reqs.next),
        level: profileData.leveling.global.level
    };

    const currGuild = (profileData.leveling.guilds.find(v => {return v.id === gid;}));

    let guild = currGuild ? {
        percentage: Math.round(currGuild.level.reqs.percentage),
        percentageFull: currGuild.level.reqs.percentage,
        currExp: currGuild.level.exp > 1000 ? Math.round(currGuild.level.exp/1000)+"K" : Math.round(currGuild.level.exp),
        req: currGuild.level.reqs.next > 1000 ? Math.round(currGuild.level.reqs.next/1000)+"K" : Math.round(currGuild.level.reqs.next),
        level: currGuild.level.level
    } : {
        percentage:0, percentageFull:0, currExp:0, currExp:0, req:0, level:0
    };

    return await LevelGuildTemp.generate({bkgnd: profileData.profile.background, gname, gurl, global, guild});
}

async function getLevelGlobal(id) {
    const profileData = (await Profile.fetch(id)).toJSON(true);
    
    let global = {
        percentage: Math.round(profileData.leveling.global.reqs.percentage),
        percentageFull: profileData.leveling.global.reqs.percentage,
        currExp: profileData.leveling.global.exp > 1000 ? Math.round(profileData.leveling.global.exp/1000)+"K" : Math.round(profileData.leveling.global.exp),
        req: profileData.leveling.global.reqs.next > 1000 ? Math.round(profileData.leveling.global.reqs.next/1000)+"K" : Math.round(profileData.leveling.global.reqs.next),
        level: profileData.leveling.global.level
    };

    return await LevelGlobalTemp.generate({bkgnd: profileData.profile.background, global});
}

const LevelComm = new CommandNode("level", async (cli, command, msg) => {
    const mention = msg.guild ? msg.mentions.members.first() : null;
    let user = msg.author;
    if(mention) user = mention.user;
    if(msg.guild) msg.channel.send(null, new MessageAttachment(await getLevel(user.id, msg.guild.name, msg.guild.iconURL({format: "png"}), msg.guild.id), `level-${user.tag}.png`));
    else msg.channel.send(null, new MessageAttachment(await getLevelGlobal(user.id), `level-${user.tag}-global.png`));
}, {
    desc: "Get your or another person's level",
    args: [{type: "user", name: "target"}]
});

const LevelGlobalComm = new CommandNode("global", async (cli, command, msg) => {
    const mention = msg.guild ? msg.mentions.members.first() : null;
    let user = msg.author;
    if(mention) user = mention.user;
    else msg.channel.send(null, new MessageAttachment(await getLevelGlobal(user.id), `level-${user.tag}-global.png`));
}, {
    desc: "Get your or another person's global level",
    args: [{type: "user", name: "target"}]
});

LevelComm.addChild(LevelGlobalComm);
LevelComm.addChild(new AliasNode("g", LevelGlobalComm));

module.exports = (client) => {
    client.registerNode(LevelComm, "!");
};