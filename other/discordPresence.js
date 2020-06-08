const userData = require("./discordUserData");
const {timed} = require("../controllers/dbMain");
const moment = require("moment");
const {MessageEmbed} = require("discord.js");

let client;

async function _30seconds() {
    let num = 0;

    setInterval(async () => {
        num = await changePresence(num);
    }, 30000);
}

async function _15seconds() {
    setInterval(async () => {
        getAllValues();
    }, 15000);
}

async function getAllValues() {
    const vals = await timed.getAllCompletedValues();
    if(vals.success) {
        vals.values.forEach(v => {
            switch(v.type) {
                case timed.TIMED_E_TYPES.REMIND_ME:
                    let channel = client.discordCli.channels.cache.get(v.extra.channel);
                    if(channel) {
                        let member = channel.guild.members.cache.get(v.user);
                        let embed = new MessageEmbed();
                        embed.setDescription(v.extra.reminder);
                        embed.setAuthor(`Reminder for ${member.user.username}`, member.user.displayAvatarURL({dynamic: true}));
                        embed.setFooter(`ID: ${v.id} | Set on: ${moment(v.created_at).format("DD MMM YYYY, HH:mm Z")}`);
                        channel.send(`${member}`, embed).then(() => {
                            timed.removeValue(v.id, v.user);
                        });
                        // channel.send(`**Reminder for ${member}**\`\`\`md\n# Reminder\n\n- REMEMBER: ${v.extra.reminder}\n\n## Reminder Info\n* ID: ${v.id}\n* Created On: ${moment(v.created_at).format("dddd, MMMM Do YYYY, h:mm:ss a")}\n\`\`\``).then(() => {
                        //     timed.removeValue(v.id, v.user);
                        // });
                    }
                    break;
                case timed.TIMED_E_TYPES.BAN_LIMIT:
                    break;
                case timed.TIMED_E_TYPES.MUTE_LIMIT:
                    break;
                default: break;
            }
        });
    }
}

async function changePresence(num){
    num += 1;

    const userd = await userData(client);    
    
    let data =  await userd.getTotals();
    let arr = ["d!help", `in ${data.guilds} guilds`, `serving ${data.users} users in total`, "games for l00ps"];

    if(num > arr.length-1)
        num = 0;

    let str = arr[num].toString();

    client.discordCli.user
    .setActivity({
        name: str,
        status: "PLAYING"
    })
    .then(presence =>
        null
    )
    .catch(console.error);
    
    return num;
}

module.exports = async function(cli) {
    client = cli;

    _30seconds();
    _15seconds();
};