const DB = require("./dbMain"),
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

const LogEvent = async function(guild, message, type, priority = PRIORITIES.LOW) {
    if(guild) {
        const logVal = await DB.guild.getLogs(guild.id);

        if(logVal.success && logVal.logs) {
            if(!logVal.logs.enabled)
                return;

            function defChnl() {
                let defChannel = guild.channels.cache.get(logVal.logs.default);
                if(defChannel) defChannel.send(embed(message, priority, type));
            }

            switch(type) {
                case EVENTS.USER_JOIN:
                case EVENTS.USER_LEAVE:
                    if(logVal.logs.ujoinleave) {
                        let channel = guild.channels.cache.get(logVal.logs.ujoinleave);
                        if(channel) {channel.send(embed(message, priority, type)); break;}
                    }
                    defChnl();
                    break;
                case EVENTS.USER_KICKED:
                    if(logVal.logs.ukicked) {
                        let channel = guild.channels.cache.get(logVal.logs.ukicked);
                        if(channel) {channel.send(embed(message, priority, type)); break;}
                    }
                    defChnl();
                    break;
                case EVENTS.USER_BANNED:
                case EVENTS.USER_UNBANNED:
                    if(logVal.logs.ubanned) {
                        let channel = guild.channels.cache.get(logVal.logs.ubanned);
                        if(channel) {channel.send(embed(message, priority, type)); break;}
                    }
                    defChnl();
                    break;
                case EVENTS.MESSAGE_DELETED:
                    if(logVal.logs.mdeleted) {
                        let channel = guild.channels.cache.get(logVal.logs.mdeleted);
                        if(channel) {channel.send(embed(message, priority, type)); break;}
                    }
                    defChnl();
                    break;
                case EVENTS.MUTED:
                case EVENTS.UNMUTED:
                    if(logVal.logs.umuted) {
                        let channel = guild.channels.cache.get(logVal.logs.umuted);
                        if(channel) {channel.send(embed(message, priority, type)); break;}
                    }
                    defChnl();
                    break;
                case EVENTS.WARNS:
                    if(logVal.logs.uwarned) {
                        let channel = guild.channels.cache.get(logVal.logs.uwarned);
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