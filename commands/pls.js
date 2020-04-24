const {Nodes: {DataNode, CommandNode}} = require("framecord"),
    {MessageEmbed} = require("discord.js"),
    nekoCli = require("nekos.life"),
	neko = new nekoCli();
	
const userq = {
	slap: [
		"I guess this is what they call slap stick humor?",
		"Why do humans enjoy violence?",
		"...",
		"Is this what is refered to as... Barbaric?"
	],
	poke: [
		"What?", "Hello?", "How may I help you?",
		"Squishy~!", "So soft~!", "Warm fingers~!",
		"I wish I had a fleshy body...", "I really can't comprehend humans...", "What is this being trying to do?",
		"Wut? Finger? Why?", "And that poke because...?", "Am I now a... 'Poke'-mon? :D", "*stares*"
	],
	pat: [
		"Thanks~!", "Thank you~!", "^w^", "Nyaa~!", "Comfy...!"
	],
	kiss: [
		"What?", "*blush*", "So soft~!", "OwO", "^w^", "Thank you~! ❤", "*returns the kiss*"
	],
	hug: [
		"Ara!", "*cuddles back*", "UwU Thank you~!"
	]
};

function sendGif(msg, img, message) {
	let embed = new MessageEmbed();
	embed.setColor(0xAD00FF);
	embed.setFooter("Provided by: https://nekos.life/");
	if(message && message !== "") embed.setDescription(message);
	embed.setImage(img);
	msg.channel.send(embed);
}

// Groups
const PlsGroup = new DataNode("pls", {name: "Please", desc: "Please commands", tags: ["entertainment", "gifs"], nsfw: false});
const PlsNSFWGroup = new CommandNode("nsfw", async (cli, command, msg) => {
	let img = (await neko.nsfw.hentai()).url;
	sendGif(msg, img);
}, {name: "Please NSFW", desc: "NSFW Please commands", tags: ["entertainment", "gifs", "nsfw"], nsfw: true});

// Normal Commands
const Baka = new CommandNode("baka", async (cli, command, msg) => {
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

const FoxGirl = new CommandNode("foxgirl", async function(cli, command, msg) {
	sendGif(msg, (await neko.sfw.foxGirl()).url);
}, {
    name: "Baka",
    desc: "Baaaka!!",
    tags: ["gifs", "images", "idiot", "retard"],
    nsfw: false
});

const Holo = new CommandNode("holo", async function(cli, command, msg) {
	sendGif(msg, (await neko.sfw.holo()).url);
}, {
    name: "Baka",
    desc: "Baaaka!!",
    tags: ["gifs", "images", "idiot", "retard"],
    nsfw: false
});

const Hug = new CommandNode("hug", async function(cli, command, msg) {
	let img = (await neko.sfw.cuddle()).url,
		mention = msg.mentions.members.first();
	if (!mention) {
		sendGif(msg, img, `${cli.user} cuddled ${msg.author}~! 
		<:peepoHuggy:582609341572448284>`);
	} else if(mention.id === cli.user.id) {
		let rnd = Math.round(Math.random()*(userq.hug.length-1));
		sendGif(msg, img, `${msg.author} hugged ${mention}! 
		<:peepoHuggy:582609341572448284> They reacted with: "${userq.hug[rnd]}"`);
	} else if (mention.id === msg.author.id) {
		sendGif(msg, img, `${msg.author} hugged themselves!`);
	} else {
		sendGif(msg, img, `${msg.author} hugged ${mention}! 
		<:peepoHuggy:582609341572448284>`);
	}
}, {
    name: "Baka",
    desc: "Baaaka!!",
    tags: ["gifs", "images", "idiot", "retard"],
    nsfw: false
});

const Kemonomimi = new CommandNode("kemonomimi", async function(cli, command, msg) {
	sendGif(msg, (await neko.sfw.kemonomimi()).url);
}, {
    name: "Baka",
    desc: "Baaaka!!",
    tags: ["gifs", "images", "idiot", "retard"],
    nsfw: false
});

const Kiss = new CommandNode("kiss", async function(cli, command, msg) {
	let img = (await neko.sfw.kiss()).url,
		mention = msg.mentions.members.first();
	if (!mention) {
		sendGif(msg, img, `${cli.user} kissed ${msg.author}! ❤`);
	} else if(mention.id === cli.discordCli.user.id) {
		let rnd = Math.round(Math.random()*(userq.kiss.length-1));
		sendGif(msg, img, `${msg.author} kissed ${mention}! ❤ They reacted with: "${userq.kiss[rnd]}"`);
	} else if (mention.id === msg.author.id) {
		sendGif(msg, img, `${msg.author} managed to kiss themselves! An amazing feat! ❤`);
	} else {
		sendGif(msg, img, `${msg.author} kissed ${mention}! ❤`);
	}
}, {
    name: "Baka",
    desc: "Baaaka!!",
    tags: ["gifs", "images", "idiot", "retard"],
    nsfw: false
});

const Lizard = new CommandNode("lizard", async function(cli, command, msg) {
	sendGif(msg, (await neko.sfw.lizard()).url);
}, {
    name: "Baka",
    desc: "Baaaka!!",
    tags: ["gifs", "images", "idiot", "retard"],
    nsfw: false
});

const Meow = new CommandNode("meow", async function(cli, command, msg) {
	sendGif(msg, (await neko.sfw.meow()).url);
}, {
    name: "Baka",
    desc: "Baaaka!!",
    tags: ["gifs", "images", "idiot", "retard"],
    nsfw: false
});

const Neko = new CommandNode("neko", async function(cli, command, msg) {
	sendGif(msg, (await neko.sfw.neko()).url);
}, {
    name: "Baka",
    desc: "Baaaka!!",
    tags: ["gifs", "images", "idiot", "retard"],
    nsfw: false
});

const NekoGif = new CommandNode("gif", async function(cli, command, msg) {
	sendGif(msg, (await neko.sfw.nekoGif()).url);
}, {
    name: "Baka",
    desc: "Baaaka!!",
    tags: ["gifs", "images", "idiot", "retard"],
    nsfw: false
});

const Pat = new CommandNode("pat", async function(cli, command, msg) {
	let img = (await neko.sfw.pat()).url,
		mention = msg.mentions.members.first();
	if (!mention) {
		sendGif(msg, img, `${cli.user} patted ${msg.author} on the head~!`);
	} else if(mention.id === cli.discordCli.user.id) {
		let rnd = Math.round(Math.random()*(userq.pat.length-1));
		sendGif(msg, img, `${msg.author} patted ${mention} on the head~! They reacted with: "${userq.pat[rnd]}"`);
	} else if (mention.id === msg.author.id) {
		sendGif(msg, img, `${msg.author} patted themselves on the head... Now... That's just sad!`);
	} else {
		sendGif(msg, img, `${msg.author} patted ${mention} on the head~!`);
	}
}, {
    name: "Baka",
    desc: "Baaaka!!",
    tags: ["gifs", "images", "idiot", "retard"],
    nsfw: false
});

const Poke = new CommandNode("poke", async function(cli, command, msg) {
	let img = (await neko.sfw.poke()).url,
		mention = msg.mentions.members.first();
	if (!mention || (mention && mention.id === msg.author.id)) {
		sendGif(msg, img, `${msg.author} poked themselves for some strange reason...`);
	} else if(mention.id === cli.discordCli.user.id) {
		let rnd = Math.round(Math.random()*(userq.poke.length-1));
		sendGif(msg, img, `${msg.author} poked ${mention}... They reacted with: "${userq.poke[rnd]}"`);
	} else {
		sendGif(msg, img, `${msg.author} poked ${mention}...`);
	}
}, {
    name: "Baka",
    desc: "Baaaka!!",
    tags: ["gifs", "images", "idiot", "retard"],
    nsfw: false
});

const Slap = new CommandNode("slap", async function(cli, command, msg) {
	let mention = msg.mentions.members.first();
	let img = (await neko.sfw.slap()).url;
	if (!mention) {
		let rnd = Math.round(Math.random()*(userq.slap.length-1));
		sendGif(msg, img, `**${msg.client.user}**: ${userq.slap[rnd]}`);
	} else if (mention.id === msg.author.id) {
		sendGif(msg, img, `${msg.author} slapped themselves really hard!`);
	} else {
		sendGif(msg, img, `${msg.author} slapped ${mention} really hard!`);
	}
}, {
    name: "Baka",
    desc: "Baaaka!!",
    tags: ["gifs", "images", "idiot", "retard"],
    nsfw: false
});

const Smug = new CommandNode("smug", async function(cli, command, msg) {
	let img = (await neko.sfw.smug()).url,
		mention = msg.mentions.members.first();
	if (!mention) {
		sendGif(msg, img);
	} else if (mention.id === msg.author.id) {
		sendGif(msg, img);
	} else {
		sendGif(msg, img, `${msg.author} threw a smug face towards ${mention}`);
	}
}, {
    name: "Baka",
    desc: "Baaaka!!",
    tags: ["gifs", "images", "idiot", "retard"],
    nsfw: false
});

const Tenor = new CommandNode("tenor", async function(cli, command, msg) {	
	if(command.args.length > 0) {
		request.get("https://api.tenor.com/v1/search").query({q: command.args.join(" "), key: "D02YZMVHAWZR", locale: "en_US", contentfilter: "medium", mediafilter: "minimal", limit: "1"}).then(res => {
			let results = res.body.results;
			if(results.length > 0)
				sendGif(msg, results[0].media[0].gif.url, `Result of: ${command.args.join(" ")}`);
			else msg.reply("No GIF was found... Sorry! ;_;");
		}).catch(err => {msg.reply("Sorry! An error seems to have occured!"); consoleCtrl.onError(err); });
	} else {
		request.get("https://api.tenor.com/v1/trending").query({key: "D02YZMVHAWZR", locale: "en_US", contentfilter: "medium", mediafilter: "minimal", limit: "1"}).then(res => {
			let results = res.body.results;
			if(results.length > 0)
				sendGif(msg, results[0].media[0].gif.url, "Currently trending");
			else msg.reply("No GIF was found... Sorry! ;_;");
		}).catch(err => {msg.reply("Sorry! An error seems to have occured!"); consoleCtrl.onError(err); });
	}
}, {
    name: "Baka",
    desc: "Baaaka!!",
    tags: ["gifs", "images", "idiot", "retard"],
    nsfw: false
});

const Tickle = new CommandNode("tickle", async function(cli, command, msg) {
	let img = (await neko.sfw.tickle()).url,
		mention = msg.mentions.members.first();
	if (!mention) {
		sendGif(msg, img, `${msg.client.user} tickled ${msg.author}!`);
	} else if (mention.id === msg.author.id) {
		sendGif(msg, img, `${msg.author} tickled themselves!`);
	} else {
		sendGif(msg, img, `${msg.author} tickled ${mention}!`);
	}
}, {
    name: "Baka",
    desc: "Baaaka!!",
    tags: ["gifs", "images", "idiot", "retard"],
    nsfw: false
});

const Woof = new CommandNode("woof", async function(cli, command, msg) {
	sendGif(msg, (await neko.sfw.woof()).url);
}, {
    name: "Baka",
    desc: "Baaaka!!",
    tags: ["gifs", "images", "idiot", "retard"],
    nsfw: false
});

// NSFW Commands
const NSFWFeet = new CommandNode("feet", async (cli, command, msg) => {
	let img = (await neko.nsfw.feet()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWFeetGif = new CommandNode("gif", async (cli, command, msg) => {
	let img = (await neko.nsfw.feetGif()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWFemdom = new CommandNode("femdom", async (cli, command, msg) => {
	let img = (await neko.nsfw.femdom()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWAnal = new CommandNode("anal", async (cli, command, msg) => {
	let img = (await neko.nsfw.anal()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWBJ = new CommandNode("bj", async (cli, command, msg) => {
	let img = (await neko.nsfw.blowJob()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWBJGif = new CommandNode("gif", async (cli, command, msg) => {
	let img = (await neko.nsfw.bJ()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWClassic = new CommandNode("classic", async (cli, command, msg) => {
	let img = (await neko.nsfw.classic()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWCum = new CommandNode("cum", async (cli, command, msg) => {
	let img = (await neko.nsfw.cumArts()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWCumGif = new CommandNode("gif", async (cli, command, msg) => {
	let img = (await neko.nsfw.cumsluts()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWFuta = new CommandNode("futa", async (cli, command, msg) => {
	let img = (await neko.nsfw.futanari()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWSoloGirl = new CommandNode("solo-girl", async (cli, command, msg) => {
	let img = (await neko.nsfw.girlSolo()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWSoloGirlGif = new CommandNode("gif", async (cli, command, msg) => {
	let img = (await neko.nsfw.girlSoloGif()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWHolo = new CommandNode("holo", async (cli, command, msg) => {
	let img = (await neko.nsfw.holo()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWKemonomimi = new CommandNode("kemonomimi", async (cli, command, msg) => {
	let img = (await neko.nsfw.kemonomimi()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWKeta = new CommandNode("keta", async (cli, command, msg) => {
	let img = (await neko.nsfw.keta()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWKitsune = new CommandNode("kitsune", async (cli, command, msg) => {
	let img = (await neko.nsfw.kitsune()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWKuni = new CommandNode("kuni", async (cli, command, msg) => {
	let img = (await neko.nsfw.kuni()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWYuri = new CommandNode("yuri", async (cli, command, msg) => {
	let img = (await neko.nsfw.yuri()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWYuriGif = new CommandNode("gif", async (cli, command, msg) => {
	let img = (await neko.nsfw.lesbian()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWNeko = new CommandNode("neko", async (cli, command, msg) => {
	let img = (await neko.nsfw.neko()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWNekoGif = new CommandNode("gif", async (cli, command, msg) => {
	let img = (await neko.nsfw.nekoGif()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWPussy = new CommandNode("pussy", async (cli, command, msg) => {
	let img = (await neko.nsfw.pussyArt()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWPussyGif1 = new CommandNode("gif", async (cli, command, msg) => {
	let img = (await neko.nsfw.pussy()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWPussyGif2 = new CommandNode("gif-2", async (cli, command, msg) => {
	let img = (await neko.nsfw.pussyWankGif()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWBoobs = new CommandNode("boobs", async (cli, command, msg) => {
	let img = (await neko.nsfw.tits()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWBoobsGif = new CommandNode("gif", async (cli, command, msg) => {
	let img = (await neko.nsfw.boobs()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWTrap = new CommandNode("trap", async (cli, command, msg) => {
	let img = (await neko.nsfw.trap()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWAvatar = new CommandNode("avatar", async (cli, command, msg) => {
	let img = (await neko.nsfw.avatar()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWGif = new CommandNode("gif", async (cli, command, msg) => {
	let img = (await neko.nsfw.randomHentaiGif()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});


// NSFW Ero Commands
const NSFWEro = new CommandNode("ero", async (cli, command, msg) => {
	let img = (await neko.nsfw.ero()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWEroFeet = new CommandNode("feet", async (cli, command, msg) => {
	let img = (await neko.nsfw.eroFeet()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWEroNeko = new CommandNode("neko", async (cli, command, msg) => {
	let img = (await neko.nsfw.eroNeko()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWEroYuri = new CommandNode("yuri", async (cli, command, msg) => {
	let img = (await neko.nsfw.eroYuri()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWEroKemonomimi = new CommandNode("kemonomimi", async (cli, command, msg) => {
	let img = (await neko.nsfw.eroKemonomimi()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWEroKitsune = new CommandNode("kitsune", async (cli, command, msg) => {
	let img = (await neko.nsfw.eroKitsune()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});

const NSFWEroHolo = new CommandNode("holo", async (cli, command, msg) => {
	let img = (await neko.nsfw.holoEro()).url;
	sendGif(msg, img);
}, {
    name: "Ero",
    desc: "Erotica",
    tags: [],
    nsfw: true
});


PlsGroup.addChild(PlsNSFWGroup);
PlsGroup.addChild(Baka);
PlsGroup.addChild(FoxGirl);
PlsGroup.addChild(Holo);
PlsGroup.addChild(Hug);
PlsGroup.addChild(Kemonomimi);
PlsGroup.addChild(Kiss);
PlsGroup.addChild(Lizard);
PlsGroup.addChild(Meow);
PlsGroup.addChild(Neko);
PlsGroup.addChild(Pat);
PlsGroup.addChild(Poke);
PlsGroup.addChild(Slap);
PlsGroup.addChild(Smug);
PlsGroup.addChild(Tenor);
PlsGroup.addChild(Tickle);
PlsGroup.addChild(Woof);

Neko.addChild(NekoGif);

PlsNSFWGroup.addChild(NSFWAnal);
PlsNSFWGroup.addChild(NSFWBJ);
PlsNSFWGroup.addChild(NSFWBoobs);
PlsNSFWGroup.addChild(NSFWClassic);
PlsNSFWGroup.addChild(NSFWCum);
PlsNSFWGroup.addChild(NSFWFuta);
PlsNSFWGroup.addChild(NSFWEro);
PlsNSFWGroup.addChild(NSFWFeet);
PlsNSFWGroup.addChild(NSFWFemdom);
PlsNSFWGroup.addChild(NSFWSoloGirl);
PlsNSFWGroup.addChild(NSFWHolo);
PlsNSFWGroup.addChild(NSFWKemonomimi);
PlsNSFWGroup.addChild(NSFWKeta);
PlsNSFWGroup.addChild(NSFWKitsune);
PlsNSFWGroup.addChild(NSFWKuni);
PlsNSFWGroup.addChild(NSFWPussy);
PlsNSFWGroup.addChild(NSFWYuri);
PlsNSFWGroup.addChild(NSFWGif);
PlsNSFWGroup.addChild(NSFWTrap);
PlsNSFWGroup.addChild(NSFWAvatar);

NSFWBoobs.addChild(NSFWBoobsGif);

NSFWBJ.addChild(NSFWBJGif);

NSFWCum.addChild(NSFWCumGif);

NSFWFeet.addChild(NSFWFeetGif);

NSFWEro.addChild(NSFWEroFeet);
NSFWEro.addChild(NSFWEroKemonomimi);
NSFWEro.addChild(NSFWEroKitsune);
NSFWEro.addChild(NSFWEroNeko);
NSFWEro.addChild(NSFWEroYuri);
NSFWEro.addChild(NSFWEroHolo);

NSFWSoloGirl.addChild(NSFWSoloGirlGif);

NSFWYuri.addChild(NSFWYuriGif);

NSFWNeko.addChild(NSFWNekoGif);

NSFWPussy.addChild(NSFWPussyGif1);
NSFWPussy.addChild(NSFWPussyGif2);

module.exports = function (cli) {
    cli.registerNode(PlsGroup, "!");
};