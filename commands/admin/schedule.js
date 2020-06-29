const {Nodes: {CommandNode, AliasNode}, ListMessage, ConfirmationMessage} = require("framecord"),
    {Permissions: {FLAGS}} = require("discord.js"),
    {timed} = require("../../controllers/dbMain"),
    moment = require("moment"),
    {TIMED_EVENTS} = require("../../controllers/constants");

const Mustache = require("mustache");
const ScheduledAmount = 10;

function reminderFunc(guild, schedmsgs, index = 0, amount = 0, limit = 0) {
    const data = {
        guild,
        haschildren: reminders ? true : false,
        children: () => {
            if(!schedmsgs.success || !schedmsgs.values.length) return;
            let page = schedmsgs.values.slice((index) * amount, (index+1) * amount);
            let arr = page.map((v, i) => {return {...v, index: i+1, for: moment(v.until).format("dddd, MMMM Do YYYY, h:mm:ss a")};});

            return arr;
        },
        index: index+1,
        limit: limit+1
    };

    const render = Mustache.render(
`\`\`\`md
# Scheduled messages for {{{guild}}}

## 🧾 Messages ({{index}}/{{limit}}){{#children}}
{{index}}) [🆔: {{id}}] {{{extra.message}}} - {{for}}{{/children}}
\`\`\``
        , data);    
    
    return render;
}

const RemindMeNode = new CommandNode("schedule", async (cli, command, msg) => {
    if(timed.IsValidTime(command.Args[2].Value)) {
        const time = timed.StringToTime(command.Args[2].Value);
        const conf = new ConfirmationMessage(msg.author.id, () => {
            timed.addTimedEvent(msg.author.id, msg.guild.id, TIMED_EVENTS.SCHEDULED_MESSAGE, time.value.end.toISOString(), {message: command.Args[1].Value, channel: msg.mentions.channels.first().id}).then(v => {
                if(v) {
                    conf.Message.edit("Message scheduled!");
                } else {
                    conf.Message.edit("There was an error!");
                }
            });
        });
        conf.send(msg.channel, `Are you sure you want to schedule this message for ${time.value.end.fromNow()}?`);
    } else {
        msg.reply(`Sorry but \`${command.Args[2].Value}\` is not a valid time. Please follow these example: \`"Poke Dotter" "1 minute, 3 hours and 5 days"\`, \`"Notice me" "1 week"\` and \`"Example" "3 months, 1 year"\`.`);
    }
}, {
    name: "Schedule Message",
    desc: "Schedule a message to be sent out",
    args: [{type: "channel", name: "Channel", optional: false}, {type: "string", name: "Reminder", optional: false}, {type: "string", name: "Time", optional: false}],
    perms: [FLAGS.ADMINISTRATOR]
});

const RemindMeListNode = new CommandNode("list", async (cli, command, msg) => {
    const res = await timed.getUserValuesOf(msg.author.id, TIMED_EVENTS.SCHEDULED_MESSAGE);
    if(res.success && res.values.length) {
        if(res.values.length > ScheduledAmount) {
            const limit = Math.ceil(res.values.length / ScheduledAmount)-1;
            const list = new ListMessage(msg.author.id, async (index) => {
                return reminderFunc(msg.guild.name, res, index, ScheduledAmount, limit);
            });
            list.IndexLimit = limit;
            list.send(msg.channel);
        } else msg.channel.send(reminderFunc(msg.guild.name, res, 0, ScheduledAmount, 0));
    } else {
        msg.reply("We haven't found any data!");
    }
}, {
    name: "Remind Me List",
    desc: "Get reminders"
});

const RemindMeRemoveNode = new CommandNode("remove", async (cli, command, msg) => {
    const res = await timed.removeValue(command.Args[0].Value, msg.author.id);
    if(res) {
        msg.reply("Message deleted!");
    } else {
        msg.reply("Message failed to delete!");
    }
}, {
    name: "Scheduled Message Remove",
    desc: "Remove a message",
    args: [{type: "number", name: "ID", optional: false}],
    perms: [FLAGS.ADMINISTRATOR]
});

RemindMeNode.addChild(RemindMeListNode);
RemindMeNode.addChild(new AliasNode("ls", RemindMeListNode));
RemindMeNode.addChild(RemindMeRemoveNode);
RemindMeNode.addChild(new AliasNode("rm", RemindMeRemoveNode));

module.exports = (client) => {
    client.registerNode(RemindMeNode, "@");
    client.registerNode(new AliasNode("sched", RemindMeNode), "@");
    client.registerNode(new AliasNode("say", RemindMeNode), "@");
};