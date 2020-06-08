const commonFilter = require("../other/swearWords");
const emojis = require("emoji-regex")();

let FilteredMessages = new Map();

const DB = require("./dbMain"),
    mustache = require("mustache"),
    DLog = require("./discordLogger"),
    Cache = require("./cache"),
    {Permissions: {FLAGS}} = require("discord.js");

mustache.escape = function (value)
{
    return value;
};

let Filter = async function(dcli, msg) {
    if(!msg.guild || msg.author.id === dcli.user.id || msg.member.permissions.has(FLAGS.ADMINISTRATOR))
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
    DLog.LogEvent(member.guild, `User \`${member.user.tag}\` has joined this Discord guild`, DLog.EVENTS.USER_JOIN);
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
    discordCli.on("message", (msg) => {Filter(discordCli, msg);});
    discordCli.on("messageUpdate", (omsg, msg) => {Filter(discordCli, msg);});
    discordCli.on("guildMemberAdd", WelcomeMessage);
    discordCli.on("guildMemberRemove", member => {
        let v = Cache.Kicked.get(member.id);
        if(v !== undefined){
            let fields = [{name: "Target", value: member.user.tag}, {name: "Enforcer", value: v.enforcer}];
            if(v.reason) fields.push({name: "Reason", value: v.reason});
            DLog.LogEvent(member.guild, {desc: `User \`${member.user.tag}\` was kicked!`, fields}, DLog.EVENTS.USER_KICKED, DLog.PRIORITIES.MEDIUM);
            Cache.Kicked.delete(member.id);
        }
        else DLog.LogEvent(member.guild, `User \`${member.user.tag}\` left the guild.`, DLog.EVENTS.USER_LEAVE);
    });
    discordCli.on("guildBanAdd", async (guild, user) => {
        let info = await guild.fetchBan(user);
        DLog.LogEvent(guild, `User \`${user.tag}\` was banned from the guild${info.reason ? " for the following reason: ```\n"+info.reason+"\n```":"!"}`, DLog.EVENTS.USER_BANNED, DLog.PRIORITIES.HIGH);
    });
    discordCli.on("messageDelete", msg => {
        if(msg.author.bot) return;
        let attachments = msg.attachments.size ? {name: "Attachments", value: msg.attachments.map(v => {return v.proxyURL;}).join("\n")} : {name: "Attachments", value: "\`None\`"};
        let reason = FilteredMessages.get(msg.id) ? {name: "Reason", value: FilteredMessages.get(msg.id)} : {name: "Reason", value: "\`None\`"};
        let message = /\S/.test(msg.cleanContent) ? {name: "Message", value: msg.cleanContent} : {name: "Message", value: "\`None\`"};
        FilteredMessages.delete(msg.id);
        DLog.LogEvent(msg.guild, {desc: `A message by \`${msg.author.tag}\` was deleted.`, fields: [message, attachments, reason]}, DLog.EVENTS.MESSAGE_DELETED);
    });
};