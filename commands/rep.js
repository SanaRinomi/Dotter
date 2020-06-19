const {Nodes: {CommandNode, AliasNode}, ConfirmationMessage} = require("framecord"),
    Profile = require("../classes/Profile"),
    moment = require("moment");

const tlimit = 15; // Time to add to rep time limit.

const RepComm = new CommandNode("reputation", async (cli, command, msg) => {
    const mention = msg.mentions.members.first();
    if(mention.user.id === msg.author.id || mention.user.bot)
        msg.reply("You must target a user that isn't yourself nor a bot! (Us bots already have enough street cred~!)");
    else {
        const upf = await Profile.fetch(msg.author.id);
        const time = upf.limits.rep ? moment(upf.limits.rep) : null;
        time.format();

        if(time && time.isAfter()){
            msg.reply(`You can reuse \`${cli.root.ID}!rep\` ${time.fromNow()}`);
            return;
        } else {
            const pf = await Profile.fetch(mention.user.id);
            pf.reputation += 1;
            pf.profileUpdate();
            msg.channel.send(`${mention}, you've just recieved a rep point from ${msg.member}!`);
            upf.limits.rep = moment().add(tlimit, "minutes").toDate();
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