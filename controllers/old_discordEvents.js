const commonFilter = require("../other/swearWords");
const emojis = require("emoji-regex")();
const {User,GuildUser} = require("../classes/User");
const {Guilds, Users, GuildUsers} = require("../rework/DBMain");
const {LevelUpTemp} = require("./canv");
const {MessageAttachment} = require("discord.js");
const moment = require("moment");

let FilteredMessages = new Map();

const {GuildConfig} = require("../classes/Guild"),
    mustache = require("mustache"),
    DLog = require("./old_discordLogger"),
    Cache = require("./cache"),
    {Permissions: {FLAGS}} = require("discord.js"),
    {EVENTS, PRIORITIES} = require("./constants");
const {Guild} = require("../classes/Guild");

mustache.escape = function (value)
{
    return value;
};

let Filter = async function(dcli, msg) {
    if(!msg.guild || msg.author.id === dcli.user.id || (msg.member && msg.member.permissions.has(FLAGS.ADMINISTRATOR)))
        return;
    const config = await GuildConfig.fetch(msg.guild.id);
    
    if(config && config.Filter.enabled) {
        let splitCont = msg.content.split(" ");
        let set = config.Filter.words ? new Set(config.Filter.words) : null;
        if((config.Filter.common && commonFilter.test(msg.content)) || (set && splitCont.filter(v => set.has(v.toLowerCase())).length)) {
            FilteredMessages.set(msg.id, "Word Filtering");
            msg.delete();
            msg.channel.send(`${msg.member} You can't use those words here!`);
        }

        if(config.Filter.emoji_limit) {
            let filteredEmojis =  [...msg.content.matchAll(/(<(?:(a:|:))(?:([^\s|><]+):)?(\d+)>)\s?/gm), ...msg.content.matchAll(emojis)];
            if(filteredEmojis.length > config.Filter.emoji_limit){
                FilteredMessages.set(msg.id, "Emoji Spam");
                msg.delete();
                msg.channel.send(`${msg.member} Don't spam emojis!`);
            }
        }
    }
};

let WelcomeMessage = async function(member) {
    DLog.LogEvent(member.user.id, member.guild, {desc: `User \`${member.user.tag}\` has joined this Discord guild`, fields: [{name: "User ID", value: member.user.id}]}, EVENTS.USER_JOIN);
    
    const config = await GuildConfig.fetch(member.guild.id);
    if(config && config.Welcome.enabled && config.Welcome.channel && config.Welcome.message) {
        const data = {
            at_user: member.toString(),
            guild_name: member.guild.name
        };

        const channel = member.guild.channels.cache.get(config.Welcome.channel);
        if(channel)
            channel.send(mustache.render(config.Welcome.message, data));
    }
};

module.exports = (discordCli) => {
    discordCli.on("message", async (msg) => {
        Filter(discordCli, msg);

        if(!msg.author.bot && !msg.system) {
            if(msg.guild) {
                GuildUser.fetch(msg.author.id, msg.guild.id).then(v => {
                    v.expCall(async (lvl) => {
                        if(lvl.type === "guild") msg.channel.send(null, new MessageAttachment(await v.generateLevelUp(lvl.level, msg.author.username, msg.author.avatarURL({format: "png"}), `level-up-${msg.author.tag}.png`)));
                    });

                    if(v._user._profile.username !== msg.author.username) {
                        v._user._profile.username = msg.author.username;
                        v._user.save();
                    }
                });

                const DBGuildRes = await Guilds.get(msg.guild.id);
                if(!DBGuildRes.success) await Guilds.insert({
                    id: msg.guild.id,
                    name: msg.guild.name,
                    icon_url: msg.guild.iconURL({size: 4096}) || null
                });

                const DBUserRes = await Users.get(msg.author.id);
                if(!DBUserRes.success) await Users.insert({
                    id: msg.author.id,
                    username: msg.author.username
                });

                const DBGuildUserRes = await GuildUsers.get(msg.member.id);
                if(!DBGuildUserRes.success) await GuildUsers.insert({
                    id: msg.member.id,
                    user_id: msg.author.id,
                    guild_id: msg.guild.id
                });

                Guild.fetch(msg.guild.id).then(v => {
                    const guildIcon = msg.guild.iconURL({size: 4096});
                    let save = false;
                    if(msg.guild.name !== v.Name) {
                        v.Name = msg.guild.name;
                        save = true;
                    }

                    if(guildIcon !== v.Icon) {
                        v.Icon = guildIcon;
                        save = true;
                    }

                    if(save) v.save();
                });
            }
            else User.fetch(msg.author.id).then(v => {
                v.expCall((lvl) => {});
                if(v._profile.username !== msg.author.username) {
                    v._profile.username = msg.author.username;
                    v.save();
                }
            });
        }
    });
    discordCli.on("messageUpdate", (omsg, msg) => {Filter(discordCli, msg);});
    discordCli.on("guildMemberAdd", WelcomeMessage);
    discordCli.on("guildMemberRemove", member => {
        let v = Cache.Kicked.get(member.id);
        let vv = Cache.Banned.get(member.id);
        if(v !== undefined){
            let fields = [{name: "Target", value: `${member.user.tag} (ID: \`${member.user.id}\`)`}, {name: "Enforcer", value: v.enforcer}];
            if(v.reason) fields.push({name: "Reason", value: v.reason});
            DLog.LogEvent(member.user.id, member.guild, {desc: `User \`${member.user.tag}\` was kicked!`, fields}, EVENTS.USER_KICKED, PRIORITIES.MEDIUM);
            if(member.guild) DB.logs.addEvent(member.user.id, member.guild.id, EVENTS.USER_KICKED, v.enforcerID, v.reason);
            Cache.Kicked.delete(member.id);
        }
        else if(vv === undefined) {
            DLog.LogEvent(member.user.id, member.guild, {desc: `User \`${member.user.tag}\` left the guild.`, fields: [{name: "User ID", value: member.user.id}]}, EVENTS.USER_LEAVE);
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
            DLog.LogEvent(user.id, guild, {desc: `User \`${v.target.tag}\` was banned from the guild.`, fields}, EVENTS.USER_BANNED, PRIORITIES.HIGH);
            Cache.Banned.delete(user.id);
        } else {
            let info = await guild.fetchBan(user);
            fields.push({name: "Target", value: `\`${user.tag}\` (ID: \`${user.id}\`)`});
            if(info.reason) fields.push({name: "Reason", value: info.reason});
            DLog.LogEvent(user.id, guild, {desc: `User \`${user.tag}\` was banned from the guild.`, fields}, EVENTS.USER_BANNED, PRIORITIES.HIGH);
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

            DLog.LogEvent(user.id, guild, {desc: `User \`${v.target}\` was unbanned from the guild.`, fields}, EVENTS.USER_UNBANNED, PRIORITIES.MEDIUM);
            Cache.Unbanned.delete(user.id);
        } else {
            fields.push({name: "Target", value: `\`${user.tag}\` (ID: \`${user.id}\`)`});
            DLog.LogEvent(user.id, guild, {desc: `User \`${user.tag}\` was unbanned from the guild.`, fields}, EVENTS.USER_UNBANNED, PRIORITIES.MEDIUM);
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
        let channel = msg.channel ? {name: "Channel", value: msg.channel.name} : {name: "Channel", value: "\`Unknown\`"};
        
        let time_live = {name: "Time Live", value: `${posted.to(deleted, true)} (Created on: \`${posted.format("DD MMM YYYY, HH:mm Z")}\` | Deleted on: \`${deleted.format("DD MMM YYYY, HH:mm Z")}\`)`};
        FilteredMessages.delete(msg.id);
        DLog.LogEvent(msg.author.id, msg.guild, {desc: `A message by \`${msg.author.tag}\` (ID: \`${msg.author.id}\`) was deleted.`, fields: [message, attachments, reason, channel, time_live]}, EVENTS.MESSAGE_DELETED);
    });
};