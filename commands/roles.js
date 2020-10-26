const {Nodes: {CommandNode, AliasNode}, ListMessage, ReactionMessage} = require("framecord"),
    {Permissions: {FLAGS}} = require("discord.js"),
    {Roles, UserRoles, RolesRequired} = require("../rework/DBMain"),
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
            let arr = page.map((v, i) => {return {id: v.id, name: v.name, index: i+1};});

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
        if(b) msg.member.roles.remove(roleIndex.id).then(async () => {
            await UserRoles.removeLinked(msg.member.id, roleIndex.id);
            obj.Message.channel.send(`Role \`${roleIndex.name}\` removed!`);
        }).catch(err => {obj.Message.channel.send(`Error attempting to remove role: \`${err.message}\``);});
        else msg.member.roles.add(roleIndex.id).then(async () => {
            await UserRoles.link(msg.member.id, roleIndex.id);
            obj.Message.channel.send(`Role \`${roleIndex.name}\` added!`);
        }).catch(err => {obj.Message.channel.send(`Error attempting to add role: \`${err.message}\``);});
    } else {
        obj.Message.edit("Selected value is invalid!");
    }
}

const RolesNode = new CommandNode("roles", async (cli, command, msg) => {
    const uroles = await Roles.get({guild_id: msg.guild.id, role_type: ROLE_TYPES.USER_ROLES}, undefined, true);
    let arr = uroles.success ? uroles.data : null;

    if(arr) {
        const user_roles = msg.member.roles.cache.array().map(v => v.id);
        arr = await Promise.all(arr.map(async v => {
            const required = await RolesRequired.get({role_target: v.id}, ["role_required", "role_group"], true);
            if(required.success)
                return {...v, req_roles: required.data};
            else return v;
        }));

        arr = arr.filter(v => {
            if(v.req_roles) {
                let groups = new Map();
                v.req_roles.forEach(vv => {
                    let group = groups.get(vv.role_group);
                    if(!group) group = [vv.role_required];
                    else group.push(vv.role_required);
                    groups.set(vv.role_group, group);
                });

                groups = [...groups.entries()];

                for (let i = 0; i < groups.length; i++) {
                    const group = groups[i][1];
                    let res = group.every(vv => user_roles.includes(vv));
                    if(res) return true;
                }

                return false;
            }
            else return true;
        });
    }

    if(arr && arr.length > RoleAmount){
        const limit = Math.ceil(uroles.size / RoleAmount)-1;
        const list = new ListMessage(msg.author.id, async (index) => {
            return roleFunc(msg.guild, arr, index, RoleAmount, limit);
        }, {func: (obj, reaction, user, deleted) => {setURole(obj, reaction, user, deleted, msg);}, emotes: reactionArr, fireonce: false});
        list.IndexLimit = limit;
        list.send(msg.channel);
    } else {
        if(arr){
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