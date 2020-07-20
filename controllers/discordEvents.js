const commonFilter = require("../other/swearWords");
const emojis = require("emoji-regex")();
const Profile = require("../classes/Profile");
const {LevelUpTemp} = require("./canv");
const {MessageAttachment} = require("discord.js");
const moment = require("moment");

let FilteredMessages = new Map();

const DB = require("./dbMain"),
    mustache = require("mustache"),
    DLog = require("./discordLogger"),
    Cache = require("./cache"),
    {Permissions: {FLAGS}} = require("discord.js"),
    {EVENTS, PRIORITIES} = require("./constants");

mustache.escape = function (value)
{
    return value;
};

let Filter = async function(dcli, msg) {
    if(!msg.guild || msg.author.id === dcli.user.id || (msg.member && msg.member.permissions.has(FLAGS.ADMINISTRATOR)))
        return;
    const filterData = await DB.guild.getFilters(msg.guild.id);
    
    if(filterData.success && filterData.data.enabled) {
        let splitCont = msg.content.split(" ");
        let set = filterData.data.words ? new Set(filterData.data.words) : null;
        if((filterData.data.common && commonFilter.test(msg.content)) || (set && splitCont.filter(v => set.has(v.toLowerCase())).length)) {
            FilteredMessages.set(msg.id, "Word Filtering");
            msg.delete();
            msg.channel.send(`${msg.member} You can't use those words here!`);
        }

        if(filterData.data.emoji_limit) {
            let filteredEmojis =  [...msg.content.matchAll(/(<(?:(a:|:))(?:([^\s|><]+):)?(\d+)>)\s?/gm), ...msg.content.matchAll(emojis)];
            if(filteredEmojis.length > filterData.data.emoji_limit){
                FilteredMessages.set(msg.id, "Emoji Spam");
                msg.delete();
                msg.channel.send(`${msg.member} Don't spam emojis!`);
            }
        }
    }
};

let WelcomeMessage = async function(member) {
    DLog.LogEvent(member.guild, {desc: `User \`${member.user.tag}\` has joined this Discord guild`, fields: [{name: "User ID", value: member.user.id}]}, EVENTS.USER_JOIN);
    if(member.guild) DB.logs.addEvent(member.user.id, member.guild.id, EVENTS.USER_JOIN);
    
    const welcomeData = await DB.guild.getWelcome(member.guild.id);
    if(welcomeData.success && welcomeData.data.enabled && welcomeData.data.channel && welcomeData.data.message) {
        const data = {
            at_user: member.toString(),
            guild_name: member.guild.name
        };

        const channel = member.guild.channels.cache.get(welcomeData.data.channel);
        if(channel)
            channel.send(mustache.render(welcomeData.data.message, data));
    }
};

module.exports = (discordCli) => {
    discordCli.on("message", (msg) => {
        Filter(discordCli, msg);
        
        if(!msg.author.bot && !msg.system)
            Profile.fetch(msg.author.id).then(v => {
                v.guild_levels[0];
                v.messageExp(msg, async (lvl) => {
                    msg.channel.send(null, new MessageAttachment(await LevelUpTemp.generate({bkgnd: v.background, level: lvl, uname: msg.author.username, aurl: msg.author.avatarURL({format: "png"})}), `level-up-${msg.author.tag}.png`));
                });
                if(v.username !== msg.author.username) {
                    v.username = msg.author.username;
                    v.profileUpdate();
                }
            });
    });
    discordCli.on("messageUpdate", (omsg, msg) => {Filter(discordCli, msg);});
    discordCli.on("guildMemberAdd", WelcomeMessage);
    discordCli.on("guildMemberRemove", member => {
        let v = Cache.Kicked.get(member.id);
        let vv = Cache.Banned.get(member.id);
        if(v !== undefined){
            let fields = [{name: "Target", value: `${member.user.tag} (ID: \`${member.user.id}\`)`}, {name: "Enforcer", value: v.enforcer}];
            if(v.reason) fields.push({name: "Reason", value: v.reason});
            DLog.LogEvent(member.guild, {desc: `User \`${member.user.tag}\` was kicked!`, fields}, EVENTS.USER_KICKED, PRIORITIES.MEDIUM);
            if(member.guild) DB.logs.addEvent(member.user.id, member.guild.id, EVENTS.USER_KICKED, v.enforcerID, v.reason);
            Cache.Kicked.delete(member.id);
        }
        else if(vv === undefined) {
            DLog.LogEvent(member.guild, {desc: `User \`${member.user.tag}\` left the guild.`, fields: [{name: "User ID", value: member.user.id}]}, EVENTS.USER_LEAVE);
            if(member.guild) DB.logs.addEvent(member.user.id, member.guild.id, EVENTS.USER_LEAVE);
            Cache.Kicked.delete(member.id);
        }
    });
    discordCli.on("guildBanAdd", async (guild, user) => {
        let v = Cache.Banned.get(user.id);
        let fields = [];
        if(v !== undefined) {
            fields.push({name: "Target", value: `\`${v.target.tag}\` (ID: \`${v.target.id}\`)`});
            fields.push({name: "Enforcer", value: v.enforcer});
            if(v.reason) fields.push({name: "Reason", value: v.reason});
            if(v.time) fields.push({name: "Time", value: `${v.time.value.end.fromNow(true)} (${v.time.value.end.format("DD MMM YYYY, HH:mm Z")})`});
            DLog.LogEvent(guild, {desc: `User \`${v.target.tag}\` was banned from the guild.`, fields}, EVENTS.USER_BANNED, PRIORITIES.HIGH);
            Cache.Banned.delete(user.id);
        } else {
            let info = await guild.fetchBan(user);
            fields.push({name: "Target", value: `\`${user.tag}\` (ID: \`${user.id}\`)`});
            if(info.reason) fields.push({name: "Reason", value: info.reason});
            DLog.LogEvent(guild, {desc: `User \`${user.tag}\` was banned from the guild.`, fields}, EVENTS.USER_BANNED, PRIORITIES.HIGH);
        }
    });
    discordCli.on("guildBanRemove", async (guild, user) => {
        let v = Cache.Unbanned.get(user.id);
        let fields = [];
        if(v !== undefined) {
            fields.push({name: "Target", value: `\`${v.target}\` (ID: \`${user.id}\`)`});
            fields.push({name: "Enforcer", value: v.enforcer});
            if(v.time) {
                fields.push({name: "Unban Reason", value: "Ban time limit reached."});
                if(v.reason) fields.push({name: "Ban Reason", value: v.reason});
                fields.push({name: "Start Date", value: `${v.time.start.fromNow()} (${v.time.start.format("DD MMM YYYY, HH:mm Z")})`});
                fields.push({name: "End Date", value: `${v.time.end.format("DD MMM YYYY, HH:mm Z")}`});
            }else if(v.reason) fields.push({name: "Unban Reason", value: v.reason});

            DLog.LogEvent(guild, {desc: `User \`${v.target}\` was unbanned from the guild.`, fields}, EVENTS.USER_UNBANNED, PRIORITIES.MEDIUM);
            Cache.Unbanned.delete(user.id);
        } else {
            fields.push({name: "Target", value: `\`${user.tag}\` (ID: \`${user.id}\`)`});
            DLog.LogEvent(guild, {desc: `User \`${user.tag}\` was unbanned from the guild.`, fields}, EVENTS.USER_UNBANNED, PRIORITIES.MEDIUM);
        }
    });
    discordCli.on("messageDelete", msg => {
        if(msg.author.bot) return;
        // Time related things
        let deleted = moment();
        let posted = moment(msg.createdAt);

        let attachments = msg.attachments.size ? {name: "Attachments", value: msg.attachments.map(v => {return v.proxyURL;}).join("\n")} : {name: "Attachments", value: "\`None\`"};
        let reason = FilteredMessages.get(msg.id) ? {name: "Reason", value: FilteredMessages.get(msg.id)} : {name: "Reason", value: "\`None\`"};
        let message = /\S/.test(msg.cleanContent) ? {name: "Message", value: msg.cleanContent} : {name: "Message", value: "\`None\`"};
        
        let time_live = {name: "Time Live", value: `${posted.to(deleted, true)} (Created on: \`${posted.format("DD MMM YYYY, HH:mm Z")}\` | Deleted on: \`${deleted.format("DD MMM YYYY, HH:mm Z")}\`)`};
        FilteredMessages.delete(msg.id);
        DLog.LogEvent(msg.guild, {desc: `A message by \`${msg.author.tag}\` (ID: \`${msg.author.id}\`) was deleted.`, fields: [message, attachments, reason, time_live]}, EVENTS.MESSAGE_DELETED);
    });
};