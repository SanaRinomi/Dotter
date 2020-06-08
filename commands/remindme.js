const {Nodes: {CommandNode, AliasNode}, ListMessage, ConfirmationMessage} = require("framecord"),
    {Permissions: {FLAGS}} = require("discord.js"),
    {timed} = require("../controllers/dbMain"),
    moment = require("moment");

const Mustache = require("mustache");
const RoleAmount = 10;
const MsgArr = new Map();
    
function roleFunc(guild, roles, index = 0, amount = 0, limit = 0) {
    const data = {
        guildName: guild.name,
        haschildren: roles ? true : false,
        children: () => {
            if(!roles.success || !roles.roles.length) return;
            let page = roles.roles.slice((index) * amount, (index+1) * amount);
            let arr = page.map((v, i) => {return {...v, index: i+1};});

            MsgArr.set(guild.id, arr);

            return arr;
        },
        index: index+1,
        limit: limit+1
    };

    const render = Mustache.render(
`\`\`\`md
# User Roles for {{{guildName}}}

## 🧾 Roles ({{index}}/{{limit}}){{#children}}
{{{index}}}) {{{name}}}{{/children}}
\`\`\``
        , data);    
    
    return render;
}

function setURole(obj, reaction, user, deleted, msg) {
    const roleVal = MsgArr.get(msg.guild.id);
    const roleIndex = roleVal ? roleVal[reactionArr.indexOf(reaction.emoji.name)] : undefined;
    if(roleIndex && roleIndex !== -1) {
        let b = msg.member.roles.cache.get(roleIndex.id) ? true : false;
        if(b) msg.member.roles.remove(roleIndex.id).then(() => {obj.Message.channel.send(`Role \`${roleIndex.name}\` removed!`);}).catch(err => {obj.Message.channel.send(`Error attempting to remove role: \`${err.message}\``);});
        else msg.member.roles.add(roleIndex.id).then(() => {obj.Message.channel.send(`Role \`${roleIndex.name}\` added!`);}).catch(err => {obj.Message.channel.send(`Error attempting to add role: \`${err.message}\``);});
    } else {
        obj.Message.edit("Selected value is invalid!");
    }
}

const RemindMeNode = new CommandNode("remindme", async (cli, command, msg) => {
    if(timed.IsValidTime(command.Args[1].Value)) {
        const time = timed.StringToTime(command.Args[1].Value);
        const conf = new ConfirmationMessage(msg.author.id, () => {
            timed.addTimedEvent(msg.author.id, msg.guild.id, timed.TIMED_E_TYPES.REMIND_ME, time.value.end.toISOString(), {reminder: command.Args[0].Value, channel: msg.channel.id}).then(v => {
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
    if(command.Args[0] && command.Args[0].Value) {
        const res = await timed.getAllUserValues(msg.author.id);
        if(res.success) {
            res.values.forEach(v => {
                msg.channel.send(`Reminder ${v.id}: \`${v.extra.reminder}\` - ${moment(v.until).format("dddd, MMMM Do YYYY, h:mm:ss a")}`);
            });
        } else {
            msg.reply("Failed to retrieve any data!");
        }
    } else {
        const res = await timed.getAllCompUserValues(msg.author.id);
        if(res.success) {
            res.values.forEach(v => {
                msg.channel.send(`Reminder ${v.id}: \`${v.extra.reminder}\` - ${moment(v.until).format("dddd, MMMM Do YYYY, h:mm:ss a")}`);
            });
        } else {
            msg.reply("Failed to retrieve any data!");
        }
    }
}, {
    name: "Remind Me List",
    desc: "Get reminders",
    args: [{type: "boolean", name: "Get all"}]
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