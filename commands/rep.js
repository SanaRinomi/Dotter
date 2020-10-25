const {Nodes: {CommandNode, AliasNode}, ConfirmationMessage} = require("framecord"),
    {User} = require("../classes/User"),
    moment = require("moment");

const tlimit = 15; // Time to add to rep time limit.

const RepComm = new CommandNode("reputation", async (cli, command, msg) => {
    const mention = msg.mentions.members.first();
    if(mention.user.id === msg.author.id || mention.user.bot)
        msg.reply("You must target a user that isn't yourself nor a bot! (Us bots already have enough street cred~!)");
    else {
        const upf = await User.fetch(msg.author.id);
        const time = upf._limits.rep ? moment(upf._limits.rep) : null;
        time.format();

        if(time && time.isAfter()){
            msg.reply(`You can reuse \`${cli.root.ID}!rep\` ${time.fromNow()}`);
            return;
        } else {
            const pf = await User.fetch(mention.user.id);
            pf._profile.reputation += 1;
            msg.channel.send(`${mention}, you've just recieved a rep point from ${msg.member}!`);
            upf._limits.rep = moment().add(tlimit, "minutes").toDate();
            pf.save();
            upf.save();
        }
    };
}, {
    desc: "Give some rep~!",
    args: [{type: "user", name: "target", optional: false}]
});

module.exports = (client) => {
    client.registerNode(RepComm, "!");
    client.registerNode(new AliasNode("rep", RepComm), "!");
};