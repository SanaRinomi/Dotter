const {Nodes: {CommandNode, AliasNode}, ConfirmationMessage} = require("framecord"),
    {User} = require("../classes/User"),
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
        const upf = await User.fetch(msg.author.id);
        const time = upf._limits.daily ? moment(upf._limits.daily) : null;
        time.format();

        if(time && time.isAfter()){
            msg.reply(`You can reuse \`${cli.root.ID}!daily\` ${time.fromNow()}`);
            return;
        } else {
            let pf, other = false;
            if(!mention || mention.user.id === msg.author.id) pf = upf;
            else {pf = await User.fetch(mention.user.id); other = true;}

            if(time && time.add(1, "day").isBefore()) {
                pf._limits.daily_count = 1;
            } else
                pf._limits.daily_count += 1;
            
            const dailyEmb = new MessageEmbed();
            dailyEmb.setThumbnail(daily_img[pf._limits.daily_count]);
            dailyEmb.setAuthor(`Day ${pf._limits.daily_count} in a row`, mention ? mention.user.displayAvatarURL({dynamic: true}) : msg.author.displayAvatarURL({dynamic: true}));

            if(pf._limits.daily_count === dailya) {
                pf._profile.currency += full;
                pf._limits.daily_count = 0;
                dailyEmb.setDescription(`${other ? mention : "You"} gained **${full}** gems today for ${other ? msg.member : "you"} completing the **full daily circle**!`);
            } else {
                pf._profile.currency += normal;
                dailyEmb.setDescription(`${other ? mention : "You"} gained **${normal}** gems today for ${other ? msg.member : "you"} registering **${pf._limits.daily_count}** out of ${dailya} times in a row!`);
            }

            msg.channel.send(other ? mention : null, dailyEmb);
            upf._limits.daily = moment().add(1, "day").toDate();
            pf.save();
            if(other) upf.save();
        }
    };
}, {
    desc: "Get your daily reward! Or give it to someone else~!",
    args: [{type: "user", name: "target"}]
});

module.exports = (client) => {
    client.registerNode(DailyComm, "!");
};