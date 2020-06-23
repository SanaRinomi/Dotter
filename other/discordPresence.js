const userData = require("./discordUserData");
const {timed} = require("../controllers/dbMain");
const moment = require("moment");
const {MessageEmbed} = require("discord.js"),
    {TIMED_EVENTS} = require("../controllers/constants"),
    {Users} = require("../controllers/cache");

let client;

async function _30seconds() {
    let num = 0;

    setInterval(async () => {
        num = await changePresence(num);
        Users.forEach(v => v.syncUser());
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
                case TIMED_EVENTS.REMIND_ME:
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
                    }
                    break;
                case TIMED_EVENTS.BAN_LIMIT: // TODO: Code in ban limit
                    break;
                case TIMED_EVENTS.MUTE_LIMIT: // TODO: Code in mute limit
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