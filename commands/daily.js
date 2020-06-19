const {Nodes: {CommandNode, AliasNode}, ConfirmationMessage} = require("framecord"),
    Profile = require("../classes/Profile"),
    moment = require("moment"),
    {MessageEmbed} = require("discord.js");

const dailya = 7; // Amount of days to complete dailies.
const normal = 10; // Amount of gems for normal dailies.
const full = 50; // Amount of gems for full dailies.

const daily_img = {
    1: "https://cdn.sanarinomi.com/images/gems/one.png",
    2: "https://cdn.sanarinomi.com/images/gems/two.png",
    3: "https://cdn.sanarinomi.com/images/gems/three.png",
    4: "https://cdn.sanarinomi.com/images/gems/four.png",
    5: "https://cdn.sanarinomi.com/images/gems/five.png",
    6: "https://cdn.sanarinomi.com/images/gems/six.png",
    7: "https://cdn.sanarinomi.com/images/gems/full.png",
};

const DailyComm = new CommandNode("daily", async (cli, command, msg) => {
    const mention = msg.mentions.members.first();
    if(mention && mention.user.bot)
        msg.reply("You must target a user that isn't a bot!");
    else {
        const upf = await Profile.fetch(msg.author.id);
        const time = upf.limits.daily ? moment(upf.limits.daily) : null;
        time.format();

        if(time && time.isAfter()){
            msg.reply(`You can reuse \`${cli.root.ID}!daily\` ${time.fromNow()}`);
            return;
        } else {
            let pf, other = false;
            if(!mention || mention.user.id === msg.author.id) pf = upf;
            else {pf = await Profile.fetch(mention.user.id); other = true;}

            if(time && time.add(1, "day").isBefore()) {
                console.log("This works");
                pf.limits.daily_count = 0;
            } else
                pf.limits.daily_count += 1;
            
            const dailyEmb = new MessageEmbed();
            dailyEmb.setThumbnail(daily_img[pf.limits.daily_count]);
            dailyEmb.setAuthor(`Day ${pf.limits.daily_count} in a row`, mention ? mention.user.displayAvatarURL({dynamic: true}) : msg.author.displayAvatarURL({dynamic: true}));

            if(pf.limits.daily_count === dailya) {
                pf.currency += full;
                pf.limits.daily_count = 0;
                dailyEmb.setDescription(`${other ? mention : "You"} gained **${full}** gems today for ${other ? msg.member : "you"} completing the **full daily circle**!`);
            } else {
                pf.currency += normal;
                dailyEmb.setDescription(`${other ? mention : "You"} gained **${normal}** gems today for ${other ? msg.member : "you"} registering **${pf.limits.daily_count}** out of ${dailya} times in a row!`);
            }

            msg.channel.send(other ? mention : null, dailyEmb);
            upf.limits.daily = moment().add(1, "day").toDate();
            pf.profileUpdate();
        }
    };
}, {
    desc: "Get your daily reward! Or give it to someone else~!",
    args: [{type: "user", name: "target"}]
});

module.exports = (client) => {
    client.registerNode(DailyComm, "!");
};