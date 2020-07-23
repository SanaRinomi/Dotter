const {Nodes: {CommandNode, AliasNode}, ListMessage, ReactionMessage} = require("framecord"),
    {Permissions: {FLAGS}} = require("discord.js"),
    {GuildRoles} = require("../classes/Guild"),
    {ROLE_TYPES} = require("../controllers/constants");

const Mustache = require("mustache");
const RoleAmount = 10;
const MsgArr = new Map();

const reactionArr = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];
    
function roleFunc(guild, roles, index = 0, amount = 0, limit = 0) {
    const data = {
        guildName: guild.name,
        haschildren: roles ? true : false,
        children: () => {
            if(!roles || !roles.length) return;
            let page = roles.slice((index) * amount, (index+1) * amount);
            let arr = page.map((v, i) => {return {id: v[0], name: v[1].name, index: i+1};});

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

const RolesNode = new CommandNode("roles", async (cli, command, msg) => {
    let uroles = await GuildRoles.fetch(msg.guild.id);
    const arr = uroles.get(ROLE_TYPES.USER_ROLES) ? [...uroles.get(ROLE_TYPES.USER_ROLES).entries()] : null;

    if(arr && arr.length > RoleAmount){
        const limit = Math.ceil(uroles.size / RoleAmount)-1;
        const list = new ListMessage(msg.author.id, async (index) => {
            return roleFunc(msg.guild, arr, index, RoleAmount, limit);
        }, {func: (obj, reaction, user, deleted) => {setURole(obj, reaction, user, deleted, msg);}, emotes: reactionArr, fireonce: false});
        list.IndexLimit = limit;
        list.send(msg.channel);
    } else {
        if(uroles.get(ROLE_TYPES.USER_ROLES) && uroles.get(ROLE_TYPES.USER_ROLES).size){
            const rcMsg = new ReactionMessage(msg.author.id, (obj, reaction, user, deleted) => {setURole(obj, reaction, user, deleted, msg);}, reactionArr.slice(0, arr.length), false, undefined, 60000);
            rcMsg.onEnd = (obj) => {obj.Message.edit(obj.Message.content+"**Roles timed out!**");};
            rcMsg.send(msg.channel, roleFunc(msg.guild, arr, 0, RoleAmount, 0));
        } else {
            msg.reply("There aren't any roles you can give yourself!");
        }
    }

}, {
    name: "User Roles",
    desc: "Add and remove roles!",
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.MANAGE_ROLES, bot: true}]
});

module.exports = (client) => {
    client.registerNode(RolesNode, "!");
};