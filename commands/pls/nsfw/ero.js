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

const node = new CommandNode("ero", async (cli, command, msg) => {
	let img = (await neko.nsfw.ero()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

module.exports = {
    node,
    path: "!pls nsfw"
};