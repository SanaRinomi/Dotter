const {Nodes: {CommandNode, AliasNode}, ListMessage, ConfirmationMessage} = require("framecord"),
    {Permissions: {FLAGS}} = require("discord.js"),
    {timed} = require("../controllers/dbMain"),
    moment = require("moment"),
    {TIMED_EVENTS} = require("../controllers/constants");

const Mustache = require("mustache");
const RoleAmount = 10;
const MsgArr = new Map();

const RemindMeNode = new CommandNode("remindme", async (cli, command, msg) => {
    if(timed.IsValidTime(command.Args[1].Value)) {
        const time = timed.StringToTime(command.Args[1].Value);
        const conf = new ConfirmationMessage(msg.author.id, () => {
            timed.addTimedEvent(msg.author.id, msg.guild.id, TIMED_EVENTS.REMIND_ME, time.value.end.toISOString(), {reminder: command.Args[0].Value, channel: msg.channel.id}).then(v => {
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
    const res = await timed.getAllUserValues(msg.author.id);
    if(res.success) {
        res.values.forEach(v => {
            msg.channel.send(`Reminder ${v.id}: \`${v.extra.reminder}\` - ${moment(v.until).format("dddd, MMMM Do YYYY, h:mm:ss a")}`);
        });
    } else {
        msg.reply("Failed to retrieve any data!");
    }
}, {
    name: "Remind Me List",
    desc: "Get reminders"
});

const RemindMeRemoveNode = new CommandNode("remove", async (cli, command, msg) => {
    const res = await timed.removeValue(command.Args[0].Value, msg.author.id);
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