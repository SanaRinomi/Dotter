const {Nodes: {CommandNode, AliasNode}, ListMessage, ReactionMessage, ConfirmationMessage} = require("framecord"),
    Profile = require("../classes/Profile"),
    {ProfileTemp} = require("../controllers/canv"),
    {MessageAttachment} = require("discord.js");

const bkgNames = [...ProfileTemp._backgrounds.keys()];

const Mustache = require("mustache");
const BkgAmount = 10;
const MsgArr = new Map();

const reactionArr = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];

async function getProfile(id, uname, aurl) {
    const profileData = (await Profile.fetch(id)).toJSON(true);
    let profile = {...(profileData.profile)};
    profile.nickname = profile.nickname ? profile.nickname : "";
    profile.description = profile.description ? profile.description : "User still needs to set a description...!";
    profile.currency = profile.currency > 10000 ? profile.currency/10000+"K" : profile.currency;
    let level = {
        percentage: Math.round(profileData.leveling.global.reqs.percentage),
        currExp: profileData.leveling.global.exp > 1000 ? Math.round(profileData.leveling.global.exp/1000)+"K" : Math.round(profileData.leveling.global.exp),
        req: profileData.leveling.global.reqs.next > 1000 ? Math.round(profileData.leveling.global.reqs.next/1000)+"K" : Math.round(profileData.leveling.global.reqs.next)
    };

    return await ProfileTemp.generate({bkgnd: profile.background, uname, aurl, leveling: (profileData.leveling), profile, level});
}
    
function bkgFunc(guild, current = "Base", index = 0, amount = 0, limit = 0) {
    const data = {
        guildName: guild.name,
        children: () => {
            let page = bkgNames.slice((index) * amount, (index+1) * amount);
            let arr = page.map((v, i) => {return {name: v === current ? `${v} (Current)` : v, index: i+1, current: v === current};});

            MsgArr.set(guild.id, arr);

            return arr;
        },
        index: index+1,
        limit: limit+1
    };

    const render = Mustache.render(
`\`\`\`md
# User Profile Backgrounds

## 🧾 Backgrounds ({{index}}/{{limit}}){{#children}}
{{{index}}}) {{{name}}}{{/children}}
\`\`\``
        , data);    
    
    return render;
}

function setUBkg(obj, reaction, uprofile, msg) {
    const bkgVal = MsgArr.get(msg.guild.id);
    const bkgIndex = bkgVal ? bkgVal[reactionArr.indexOf(reaction.emoji.name)] : undefined;
    if(bkgIndex && bkgIndex !== -1) {        
        if(bkgIndex.current) obj.Message.channel.send(`Already using backgorund: ${bkgIndex.name}`);
        else {
            uprofile.background = bkgIndex.name;
            uprofile.profileUpdate();
            obj.Message.channel.send(`Set background to: ${bkgIndex.name}`);
        }
    } else {
        obj.Message.edit("Selected value is invalid!");
    }
}

const ProfileComm = new CommandNode("profile", async (cli, command, msg) => {
    const mention = msg.mentions.members.first();
    let user = msg.author;
    if(mention) user = mention.user;
    msg.channel.send(null, new MessageAttachment(await getProfile(user.id, user.tag, user.avatarURL({format: "png"})), `profile-${user.tag}.png`));
}, {
    desc: "Get your or another person's profile",
    args: [{type: "user", name: "target"}]
});

const ProfileBkg = new CommandNode("backgrounds", async (cli, command, msg) => {
    const UProfile = await Profile.fetch(msg.author.id);
    const current = UProfile.background;
    if(bkgNames.length > BkgAmount){
        const limit = Math.ceil(bkgNames.length / BkgAmount)-1;
        const list = new ListMessage(msg.author.id, async (index) => {
            return bkgFunc(msg.guild, current, index, BkgAmount, limit);
        }, {func: (obj, reaction, user, deleted) => {setUBkg(obj, reaction, UProfile, msg);}, emotes: reactionArr, fireonce: true});
        list.IndexLimit = limit;
        list.send(msg.channel);
    } else {
        const rcMsg = new ReactionMessage(msg.author.id, (obj, reaction, user, deleted) => {setUBkg(obj, reaction, UProfile, msg);}, reactionArr.slice(0, bkgNames.length), true, undefined, 60000);
        rcMsg.onEnd = (obj) => {obj.Message.edit(obj.Message.content+"**User Backgrounds timed out!**");};
        rcMsg.send(msg.channel, bkgFunc(msg.guild, current, 0, BkgAmount, 0));
    }
}, {
    name: "Profile Background",
    desc: "Set your profile background"
});

const charLimit = 244;
const ProfileDesc = new CommandNode("description", async (cli, command, msg) => {
    // ....................................................................................................................................................................................................................................................

    if(command.Args[0].Value.length > charLimit) {
        msg.reply(`You need to limit your description to ${charLimit} characters!`);
        return;
    }

    const UProfile = await Profile.fetch(msg.author.id);
    const DescMess = new ConfirmationMessage(msg.author.id, (obj) => {
        UProfile.description = command.Args[0].Value;
        UProfile.profileUpdate();
        obj.Message.edit("Description set!");
    });
    DescMess.send(msg.channel, `Are you sure you want to set your description to \`${command.Args[0].Value}\`?`);
}, {
    name: "Profile Description",
    desc: "Set your profile description",
    args: [{type: "string", name: "text", optional: false}]
});

const ProfileDescReset = new CommandNode("reset", async (cli, command, msg) => {
    const UProfile = await Profile.fetch(msg.author.id);
    const DescMess = new ConfirmationMessage(msg.author.id, (obj) => {
        UProfile.description = "";
        UProfile.profileUpdate();
        obj.Message.edit("Description set!");
    });
    DescMess.send(msg.channel, "Are you sure you want reset your description?");
}, {
    name: "Description Reset",
    desc: "Reset your profile description"
});

ProfileComm.addChild(ProfileBkg);
ProfileComm.addChild(ProfileDesc);
ProfileDesc.addChild(ProfileDescReset);
ProfileComm.addChild(new AliasNode("background", ProfileBkg));
ProfileComm.addChild(new AliasNode("bkg", ProfileBkg));
ProfileComm.addChild(new AliasNode("desc", ProfileDesc));
ProfileDesc.addChild(new AliasNode("clear", ProfileDescReset));

module.exports = (client) => {
    client.registerNode(ProfileComm, "!");
};