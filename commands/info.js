const {Nodes: {CommandNode, AliasNode}} = require("framecord"),
    {MessageEmbed, Permissions: {FLAGS}} = require("discord.js"),
    Mustache = require("mustache"),
    moment = require("moment"),
    si = require("systeminformation"),
    userData = require("../other/discordUserData"),
    pkg = require("../package.json");

let framecord, cpu, os;

require("child_process").exec("npm info framecord version", function(err, stdout, stderr) {
    if(err) framecord = "Unavailable";
    else framecord = stdout;
});

function secondsToHms(d, simple = false) {
    d = Number(d);

    let da = Math.floor(d / 86400);
    let h = Math.floor(d % 86400 / 3600);
    let m = Math.floor(d % 86400 % 3600 / 60);
    let s = Math.floor(d % 86400 % 3600 % 60);

    let dDisplay, hDisplay, mDisplay, sDisplay;

    if(simple) {
        dDisplay = da > 0 ? da + (da === 1 ? " day, " : " days, ") : "";
        hDisplay = h > 0 ? (h < 9 ? "0" : "") + h + ":" : dDisplay ? "00:" : "";
        mDisplay = m > 0 ? (m < 9 ? "0" : "") + m + ":" : "00:";
        sDisplay = s > 0 ? (s < 9 ? "0" : "") + s : mDisplay ? "00" : "";
    } else {
        dDisplay = da > 0 ? da + (da === 1 ? " day, " : " days, ") : "";
        hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : dDisplay ? "0 hours, " : "";
        mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : hDisplay ? "0 minutes, " : "";
        sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : mDisplay ? "0 seconds" : "";
    }
    
    return dDisplay + hDisplay + mDisplay + sDisplay; 
}

function bytesToSize(bytes) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "N/A";
    const i = parseInt(Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024)), 10);
    if (i === 0) return `${bytes} ${sizes[i]})`;
    return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`;
}

async function getCPU() {
    if(cpu === undefined)
        cpu = await si.cpu();

    return `${cpu.cores}x ${cpu.manufacturer} ${cpu.brand} @${cpu.speed}GHz`;
}

async function getOS() {
    if(os === undefined)
        os = await si.osInfo();

    return `${os.platform} ${os.distro} ${os.release}`;
}

async function getMem() {
    let mem = await si.mem();

    return {
        total: bytesToSize(mem.total),
        used: bytesToSize(mem.used),
        available: bytesToSize(mem.available),
        bybot: bytesToSize(process.memoryUsage().heapUsed)
    };
}

const InfoGroup = new CommandNode("info", (cli, command, msg) => {
    const mention = msg.mentions.members.first();
    const guser =  mention ? mention : msg.member;
    const user = mention ? mention.user : msg.author;
    let userroles = null;

    if(msg.guild){
        userroles = "";
        guser.roles.cache.each(role => { if(role.name === "@everyone") return; userroles += userroles ? ", " + role.name : role.name; });
    }
    

	const data = {
        name: msg.guild ? guser.displayName : user.username,
        username: user.username,
        usertag: user.tag,
        userid: user.id,
        usercreated: moment(user.createdAt).fromNow(true) + " ago",
        userstatus: function() {
            let userpresence = user.presence.status.charAt(0).toUpperCase() + user.presence.status.slice(1).toLowerCase();
            if(userpresence === "Dnd") userpresence = "Do not Disturb";

            user.presence.activities.forEach(activity => {
                userpresence += "\n";

                switch (activity.type) {
                    case "STREAMING":
                        userpresence += `* Streaming: ${activity.name} on Twitch\n  * ${activity.assets.largeImage.split(":")[1]} (URL: ${activity.url})`;
                        break;
            
                    case "LISTENING":
                        userpresence += `* Listening: ${activity.details} by ${activity.state} on ${activity.name} (Duration: ${secondsToHms(Math.floor((activity.timestamps.end - activity.timestamps.start) / 1000), true)})`;
                        break;
            
                    case "WATCHING":
                        userpresence += `* Watching: ${activity.name}`;
                        break;

                    case "CUSTOM_STATUS":
                        userpresence += `* Custom: ${activity.state} ${activity.emoji ? "(Emoji: :" + activity.emoji.name + ":)" : ""}`;
                        break;
                
                    default:
                        userpresence += `* Playing: ${activity.name}`;
                        break;
                }
            });

            return userpresence;
        },
        guild: {
            inguild: msg.guild ? true : false,
            name: msg.guild ? msg.guild.name : null,
            joined: msg.guild ? moment(guser.joinedAt).fromNow(true) + " ago" : null,
            roles: userroles ? userroles : "None"
        }
    };

    const render = Mustache.render(
`\`\`\`md
# 🧑 {{{name}}}'s User

## 📄 Info
* Username: {{{username}}}
* Tag: {{{usertag}}}
* ID: {{userid}}
* Created {{usercreated}}

## 💬 Current Status
* Status: {{{userstatus}}}

{{#guild.inguild}}## 🌐 Guild Info ({{{guild.name}}})
* Joined {{guild.joined}}
* Roles: {{{guild.roles}}}
{{/guild.inguild}}
\`\`\``
    , data);

    msg.channel.send(render);

}, {
    name: "Information",
    desc: "Get Information",
    args: [{name: "User", type: "user"}]
});

const GuildInfo = new CommandNode("guild", async (cli, command, msg) => {
    if (!msg.guild) {
        msg.reply("This command needs to be executed in a Discord server!");
        return;
    }
    
    let userd = await userData(cli);
    let users = await userd.getGuildUsers(msg.guild.id);    

	const data = {
        users,
        name: msg.guild.name,
        acro: msg.guild.nameAcronym,
        id: msg.guild.id,
        verified: msg.guild.verified ? "Yes." : "No.",
        owner: msg.guild.owner.nickname ? msg.guild.owner.nickname : msg.guild.owner.user.username,
        created: moment(msg.guild.createdAt).fromNow(true) + " ago",
        region: msg.guild.region,
        roles: msg.guild.roles.cache.size,
        emojis: msg.guild.emojis.cache.size,
        channels: msg.guild.channels.cache.size
    };

    const render = Mustache.render(
`\`\`\`md
# 🏢 {{{acro}}} Discord Guild

## 📄 Info
* Name: {{{name}}}
* ID: {{id}}
* Owner: {{{owner}}}
* Verified: {{verified}}

## 👥 Users ({{users.users}})
* Online: {{users.online}}
* Idle: {{users.idle}}
* Don't Disturb: {{users.dnd}}
* Offline: {{users.invis}}

## 📊 Additional Info

* Created {{created}}
* Region: {{region}}

* Channels: {{channels}}
* Roles: {{roles}}
* Bots: {{users.bots}}
* Emotes: {{emojis}}

NOTE: User data is updated every minute.\`\`\``
    , data);

    msg.channel.send(render);

}, {name: "Guild", desc: "Guild (Discord Server) Information", tags: [], nsfw: false});

const StatInfo = new CommandNode("statistics", async (cli, command, msg) => {    
    const userd = await userData(cli);
    let udata = await userd.getTotals();    

	const data = {
        udata,
        name: cli.discordCli.user.username,
        cpu: await getCPU(),
        os: await getOS(),
        mem: await getMem(),
        uptime: secondsToHms(process.uptime()),
        versions: {
            node: process.version,
            framecord
        }
    };

    const render = Mustache.render(
`\`\`\`md
# 🖥 {{{name}}} Statistics and Data

## 📄 Info
* CPU: {{{cpu}}}
* OS: {{{os}}}
* NodeJS Version: {{versions.node}}
* FrameCord Version: {{versions.framecord}}

## 📊 Statistics
* Uptime: {{uptime}}
* Guilds: {{udata.guilds}}
* Users: {{udata.users}}
  * Online: {{udata.online}}
  * Idleing: {{udata.idle}}
  * DnD: {{udata.dnd}}
  * Offline: {{udata.invis}}

## 💾 Memory (Total: {{mem.total}})
* Available: {{mem.available}}
* Used: {{mem.used}}
  * By Bot: {{mem.bybot}}
\`\`\``
    , data);

    msg.channel.send(render);

}, {name: "Bot Stats & Data", desc: "Bot Statistics and other data.", tags: [], nsfw: false});

const About = new CommandNode("about", async (cli, command, msg) => {

	const data = {
        name: cli.discordCli.user.username,
        framecord: framecord.replace("\n", ""),
        version: pkg.version
    };

    const render = Mustache.render(
`Hello! I'm **{{name}}**!

I'm **version {{version}}** of a Discord bot developed by Amelia Rose Aldridge AKA [**Sana Rinomi**](https://sanarinomi.com) to help with **Administration and Entertainment**.

I'm using **FrameCord version {{framecord}}**, more info on my development over at [**Trello board** here](https://trello.com/b/QipahO0w/dotter).
To add me to your Discord [**click here!**](https://discordapp.com/oauth2/authorize/?permissions=2146958591&scope=bot&client_id=562604110826831908)

To help with my development consider [**leaving a one-time donation**](https://www.paypal.me/sanarinomi), or [**subscribe on Patreon**](https://www.patreon.com/sanarinomi).`
    , data);

    let embed = new MessageEmbed();
    embed.setColor(0xAD00FF);
    embed.setAuthor(cli.discordCli.user.username, cli.discordCli.user.avatarURL());
    embed.setDescription(render);

    msg.channel.send(embed);

}, {desc: "About Dotter", perms: [FLAGS.SEND_MESSAGES, FLAGS.EMBED_LINKS]});

InfoGroup.addChild(About);
InfoGroup.addChild(new AliasNode("bot", About));
InfoGroup.addChild(GuildInfo);
InfoGroup.addChild(new AliasNode("g", GuildInfo));
InfoGroup.addChild(StatInfo);
InfoGroup.addChild(new AliasNode("data", StatInfo));
InfoGroup.addChild(new AliasNode("stats", StatInfo));
InfoGroup.addChild(new AliasNode("d", StatInfo));
InfoGroup.addChild(new AliasNode("s", StatInfo));

module.exports = function(client) {
    client.registerNode(InfoGroup, "!");
    client.registerNode(About.clone(), "!");
};