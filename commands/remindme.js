const {Nodes: {CommandNode, AliasNode}, ListMessage, ConfirmationMessage} = require("framecord"),
    {Permissions: {FLAGS}} = require("discord.js"),
    {EventData} = require("../controllers/dbMain"),
    moment = require("moment"),
    {TIMED_EVENTS} = require("../controllers/constants");

const Mustache = require("mustache");
const ReminderAmount = 10;

function reminderFunc(username, reminders, index = 0, amount = 0, limit = 0) {
    const data = {
        username: username,
        haschildren: reminders ? true : false,
        children: () => {
            if(!reminders.success || !reminders.data.length) return;
            let page = reminders.data.slice((index) * amount, (index+1) * amount);
            let arr = page.map((v, i) => {return {...v, index: i+1, for: moment(v.until).format("dddd, MMMM Do YYYY, h:mm:ss a")};});

            return arr;
        },
        index: index+1,
        limit: limit+1
    };

    const render = Mustache.render(
`\`\`\`md
# Reminders for {{{username}}}

## 🧾 Reminders ({{index}}/{{limit}}){{#children}}
{{index}}) [🆔: {{id}}] {{{extra.reminder}}} - {{for}}{{/children}}
\`\`\``
        , data);    
    
    return render;
}

const RemindMeNode = new CommandNode("remindme", async (cli, command, msg) => {
    if(EventData.isValidTime(command.Args[1].Value)) {
        if(msg.mentions.everyone) {
            msg.reply("Please refrain from mentioning everyone in reminders.");
            return;
        }

        const role = msg.mentions.roles.first(), user = msg.mentions.members.first();
        if(role || user) {
            msg.reply("Please refrain from mentioning other users and roles in reminders.");
            return;
        }

        const time = EventData.stringToTime(command.Args[1].Value);
        const conf = new ConfirmationMessage(msg.author.id, () => {
            EventData.insert({user: msg.author.id, guild: msg.guild.id, type: TIMED_EVENTS.REMIND_ME, until: time.value.end.toISOString(), extra: {reminder: command.Args[0].Value, channel: msg.channel.id}}).then(v => {
                if(v) {
                    conf.Message.edit("Reminder set!");
                } else {
                    conf.Message.edit("There was an error!");
                }
            });
        });
        conf.send(msg.channel, `Are you sure you want to be reminded of this ${time.value.end.fromNow()}?`);
    } else {
        msg.reply(`Sorry but \`${command.Args[1].Value}\` is not a valid time. Please follow these example: \`"Poke Dotter" "1 minute, 3 hours and 5 days"\`, \`"Pls remind me" "1 week"\` and \`"Example" "3 months, 1 year"\`.`);
    }
}, {
    name: "Remind Me",
    desc: "Give yourself a reminder",
    args: [{type: "string", name: "Reminder", optional: false}, {type: "string", name: "Time", optional: false}]
});

const RemindMeListNode = new CommandNode("list", async (cli, command, msg) => {
    const res = await EventData.get({user: msg.author.id, type: TIMED_EVENTS.REMIND_ME}, null, true);
    if(res.success && res.data.length) {
        if(res.data.length > ReminderAmount) {
            const limit = Math.ceil(res.data.length / ReminderAmount)-1;
            const list = new ListMessage(msg.author.id, async (index) => {
                return reminderFunc(msg.author.tag, res, index, ReminderAmount, limit);
            });
            list.IndexLimit = limit;
            list.send(msg.channel);
        } else msg.channel.send(reminderFunc(msg.author.tag, res, 0, ReminderAmount, 0));
    } else {
        msg.reply("We haven't found any data!");
    }
}, {
    name: "Remind Me List",
    desc: "Get reminders"
});

const RemindMeRemoveNode = new CommandNode("remove", async (cli, command, msg) => {
    const res = await EventData.del({id:command.Args[0].Value, user:msg.author.id});
    if(res) {
        msg.reply("Reminder deleted!");
    } else {
        msg.reply("Reminder failed to delete!");
    }
}, {
    name: "Remind Me Remove",
    desc: "Remove a reminder",
    args: [{type: "number", name: "ID", optional: false}]
});

RemindMeNode.addChild(RemindMeListNode);
RemindMeNode.addChild(new AliasNode("ls", RemindMeListNode));
RemindMeNode.addChild(RemindMeRemoveNode);
RemindMeNode.addChild(new AliasNode("rm", RemindMeRemoveNode));

module.exports = (client) => {
    client.registerNode(RemindMeNode, "!");
    client.registerNode(new AliasNode("remember", RemindMeNode), "!");
    client.registerNode(new AliasNode("reminder", RemindMeNode), "!");
    client.registerNode(new AliasNode("remind", RemindMeNode), "!");
};