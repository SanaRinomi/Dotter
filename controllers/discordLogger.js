const {GuildConfig} = require("../classes/Guild"),
    {GuildUser} = require("../classes/User"),
    {MessageEmbed} = require("discord.js"),
    {EVENTS, PRIORITIES} = require("./constants");

function embed(message, priority, type) {
    const priorityStr = priority === PRIORITIES.LOW ? "LOW" : priority === PRIORITIES.MEDIUM ? "MEDIUM" : priority === PRIORITIES.HIGH ? "HIGH" : priority === PRIORITIES.CRITICAL ? "CRITICAL" : "";
    let evName;

    switch(type) {
        case EVENTS.USER_JOIN:
            evName = "User Joined";
            break;
        case EVENTS.USER_LEAVE:
            evName = "User Leave";
            break;
        case EVENTS.USER_KICKED:
            evName = "User Kicked";
            break;
        case EVENTS.USER_BANNED:
            evName = "User Banned";
            break;
        case EVENTS.USER_UNBANNED:
            evName = "User Unbanned";
            break;
        case EVENTS.MESSAGE_DELETED:
            evName = "Message Deleted";
            break;
        case EVENTS.MUTED:
            evName = "User Muted";
            break;
        case EVENTS.WARNS:
            evName = "User Warned";
            break;
        case EVENTS.UNMUTED:
            evName = "User Unmuted";
            break;
        case EVENTS.ERROR:
            evName = "Error";
            break;
        default:
            evName = "Unspecified";
            break;
    }

    let desc = typeof message === "object" ? message.desc : message;
    let fields = typeof message === "object" ? message.fields : [];

    let embed = new MessageEmbed();
    embed.setTitle(evName);
    embed.setDescription(desc);
    fields.forEach(v => {
        embed.addField(v.name, v.value);
    });

    embed.setColor(priority);
    embed.setTimestamp(Date.now());
    embed.setFooter(`${evName} | ${priorityStr}`);
    return embed;
}

const LogEvent = async function(user, guild, message, type, priority = PRIORITIES.LOW) {
    if(guild) {
        if(type !== EVENTS.ERROR) GuildUser.fetch(user, guild.id).then(v => {
            if(v) {
                if(typeof message === "object") {
                    let fields = [...message.fields].filter(vv => vv.value !== "`None`");
                    let indexes = [fields.findIndex(vv => vv.name === "Enforcer"), fields.findIndex(vv => vv.name === "Reason")];
                    let enforcer = indexes[0] >= 0 ? fields.splice(indexes[0], 1) : null;
                    let reason = indexes[1] >= 0 ? fields.splice(indexes[1], 1) : null;
                    v.log(type, reason, enforcer, fields);
                } else v.log(type);
            }
        });

        const config = await GuildConfig.fetch(guild.id);

        if(config && config.Logs) {
            if(!config.Logs.enabled)
                return;

            function defChnl() {
                let defChannel = guild.channels.cache.get(config.Logs.default);
                if(defChannel) defChannel.send(embed(message, priority, type));
            }

            switch(type) {
                case EVENTS.USER_JOIN:
                case EVENTS.USER_LEAVE:
                    if(config.Logs.ujoinleave) {
                        let channel = guild.channels.cache.get(config.Logs.ujoinleave);
                        if(channel) {channel.send(embed(message, priority, type)); break;}
                    }
                    defChnl();
                    break;
                case EVENTS.USER_KICKED:
                    if(config.Logs.ukicked) {
                        let channel = guild.channels.cache.get(config.Logs.ukicked);
                        if(channel) {channel.send(embed(message, priority, type)); break;}
                    }
                    defChnl();
                    break;
                case EVENTS.USER_BANNED:
                case EVENTS.USER_UNBANNED:
                    if(config.Logs.ubanned) {
                        let channel = guild.channels.cache.get(config.Logs.ubanned);
                        if(channel) {channel.send(embed(message, priority, type)); break;}
                    }
                    defChnl();
                    break;
                case EVENTS.MESSAGE_DELETED:
                    if(config.Logs.mdeleted) {
                        let channel = guild.channels.cache.get(config.Logs.mdeleted);
                        if(channel) {channel.send(embed(message, priority, type)); break;}
                    }
                    defChnl();
                    break;
                case EVENTS.MUTED:
                case EVENTS.UNMUTED:
                    if(config.Logs.umuted) {
                        let channel = guild.channels.cache.get(config.Logs.umuted);
                        if(channel) {channel.send(embed(message, priority, type)); break;}
                    }
                    defChnl();
                    break;
                case EVENTS.WARNS:
                    if(config.Logs.uwarned) {
                        let channel = guild.channels.cache.get(config.Logs.uwarned);
                        if(channel) {channel.send(embed(message, priority, type)); break;}
                    }
                    defChnl();
                    break;
                default:
                    defChnl();
                    break;
            }
        }
    }
};

module.exports = {
    PRIORITIES,
    EVENTS,
    LogEvent
};