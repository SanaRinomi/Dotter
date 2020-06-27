const userData = require("./discordUserData");
const {timed, roles} = require("../controllers/dbMain");
const moment = require("moment");
const {MessageEmbed} = require("discord.js"),
    {TIMED_EVENTS, EVENTS, PRIORITIES, ROLE_TYPES} = require("../controllers/constants"),
    {Users, Unbanned} = require("../controllers/cache"),
    DLog = require("../controllers/discordLogger");

let attempts = new Map();

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
            const guild = client.discordCli.guilds.resolve(v.guild);
            if(!guild) {
                timed.removeValue(v.id, v.user);
                return;
            }

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
                    } else {
                        let vv = attempts.get(v.id);
                        vv = vv ? vv : 0;
                        if(vv > 5) {
                            timed.removeValue(v.id, v.user);
                            attempts.delete(v.id);
                        } else attempts.set(v.id, vv++);
                    }
                    break;
                case TIMED_EVENTS.BAN_LIMIT:
                    Unbanned.set(v.user, {...v.extra, time: {start: moment(v.created_at), end: moment(v.until)}});
                    guild.members.unban(v.user).then(vv => {
                        timed.removeValue(v.id, v.user);
                    }).catch(err => {
                        Unbanned.delete(v.user);
                        if(err.message === "Unknown Ban")
                            DLog.LogEvent(guild, {desc: `Failed to unban user \`${v.extra.target}\`.`, fields: [{name: "Target", value: `\`${v.extra.target}\` (ID: \`${v.user}\`)`}, {name: "Error", value: `\`${err.message}\`, This error is most likely caused because you unbanned the user before their ban limit was reached. **This can be generally safely ignored**!`}]}, EVENTS.ERROR, PRIORITIES.CRITICAL);
                        else DLog.LogEvent(guild, {desc: `Failed to unban user \`${v.extra.target}\`.`, fields: [{name: "Target", value: `\`${v.extra.target}\` (ID: \`${v.user}\`)`}, {name: "Error", value: err.message}, {name: "Event ID", value: v.id}]}, EVENTS.ERROR, PRIORITIES.CRITICAL);
                        timed.removeValue(v.id, v.user);
                    });
                    break;
                case TIMED_EVENTS.MUTE_LIMIT:
                    timed.removeValue(v.id, v.user);
                    roles.getValue(v.guild, ROLE_TYPES.MUTE_ROLE).then(val => {
                        if(!val.success) {
                            DLog.LogEvent(guild, {desc: `Failed to unmute \`${v.extra.target}\`.`, fields: [{name: "Target", value: `\`${v.extra.target}\` (ID: \`${v.user}\`)`}, {name: "Error", value: "Mute role has not been set."}]}, EVENTS.ERROR, PRIORITIES.CRITICAL);
                            return;
                        }

                        let member = guild.members.resolve(v.user);
                        member.roles.remove(val.roles[0], "[Unmute] Mute time limit reached.").then(vv => {
                            let time = {start: moment(v.created_at), end: moment(v.until)};
                            let fields = [];
                            fields.push({name: "Target", value: `\`${v.extra.target}\` (ID: \`${v.user}\`)`});
                            fields.push({name: "Enforcer", value: v.extra.enforcer});
                            fields.push({name: "Unmute Reason", value: "Mute time limit reached."});
                            if(v.extra.reason) fields.push({name: "Mute Reason", value: v.extra.reason});
                            fields.push({name: "Start Date", value: `${time.start.fromNow()} (${time.start.format("DD MMM YYYY, HH:mm Z")})`});
                            fields.push({name: "End Date", value: `${time.end.format("DD MMM YYYY, HH:mm Z")}`});
                            DLog.LogEvent(guild, {desc: `User \`${v.extra.target}\` was unmuted.`, fields}, EVENTS.UNMUTED, PRIORITIES.MEDIUM);
                        });
                    }).catch(err => {console.log(err);});
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