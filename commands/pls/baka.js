const {Nodes: {CommandNode}} = require("framecord"),
    {MessageEmbed} = require("discord.js"),
    nekoCli = require("nekos.life"),
    neko = new nekoCli();

function sendGif(msg, img, message) {
	let embed = new MessageEmbed();
	embed.setColor(0xAD00FF);
	embed.setFooter("Provided by: https://nekos.life/");
	if(message && message !== "") embed.setDescription(message);
	embed.setImage(img);
	msg.channel.send(embed);
}

const node = new CommandNode("baka", async (cli, command, msg) => {
    let mention = msg.mentions.members.first();
		let img = (await neko.sfw.baka()).url;
		if (!mention) {
			sendGif(msg, img);
		} else if (mention.id === msg.author.id) {
			sendGif(msg, img, `${msg.author} called themselves an idiot...`);
		} else {
			sendGif(msg, img, `${msg.author} calls ${mention} a BAAAAAAKA~!`);
		}
}, {
    name: "Baka",
    desc: "Baaaka!!",
    tags: ["gifs", "images", "idiot", "retard"],
    nsfw: false
});

module.exports = {
    node,
    path: "!pls"
};