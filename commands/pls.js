const {Nodes: {DataNode, CommandNode, AliasNode}} = require("framecord"),
    {MessageEmbed} = require("discord.js"),
    nekoCli = require("nekos.life"),
    neko = new nekoCli(),
    fetch = require("node-fetch");
	
const userq = {
	slap: [
		"I guess this is what they call slap stick humor?",
		"Why do humans enjoy violence?",
		"...",
		"Is this what is refered to as... Barbaric?",
		"*Blushes*"
	],
	poke: [
		"What?", "Hello?", "How may I help you?",
		"Squishy~!", "So soft~!", "Warm fingers~!",
		"I wish I had a fleshy body...", "I really can't comprehend humans...", "What is this being trying to do?",
		"Wut? Finger? Why?", "And that poke because...?", "Am I now a... 'Poke'-mon? :D", "*stares*", "Poke me again, and I'll show you who your parental figure is!"
	],
	pat: [
		"Thanks~!", "Thank you~!", "^w^", "Nyaa~!", "Comfy...!", "*blushes*"
	],
	kiss: [
		"What?", "*blush*", "So soft~!", "OwO", "^w^", "Thank you~! ❤", "*returns the kiss*"
	],
	hug: [
		"Ara~! Ara~!", "*cuddles back*", "UwU Thank you~!"
	]
};

function sendGif(msg, img, message, provider = "https://nekos.life/") {
	let embed = new MessageEmbed();
	embed.setColor(0xAD00FF);
	embed.setFooter("Provided by: " + provider);
	if(message && message !== "") embed.setDescription(message);
	embed.setImage(img);
	msg.channel.send(embed);
}

// Groups
const PlsGroup = new DataNode("pls", {name: "Please", desc: "Please commands", tags: ["entertainment", "gifs"]});
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
		sendGif(msg, img, `${msg.author} calls ${mention} a BAAAAAAKA~! *pouts*`);
	}
}, {
    desc: "Baaaka!!",
    tags: ["gifs", "images", "idiot", "retard"],
    args: [{name: "User", type: "user"}]
});

const FoxGirl = new CommandNode("foxgirl", async function(cli, command, msg) {
	sendGif(msg, (await neko.sfw.foxGirl()).url);
}, {
    name: "Fox Girl",
    desc: "Return a Fox Girl!",
    tags: ["gifs", "images", "fox", "girl"]
});

const Holo = new CommandNode("holo", async function(cli, command, msg) {
	sendGif(msg, (await neko.sfw.holo()).url);
}, {
    desc: "Returns a Holo image or gif!",
    tags: ["gifs", "images", "wolf girl"]
});

const Hug = new CommandNode("hug", async function(cli, command, msg) {
	let img = (await neko.sfw.cuddle()).url,
		mention = msg.mentions.members.first();
	if (!mention) {
		sendGif(msg, img, `${cli.discordCli.user} cuddled ${msg.author}~! <:peepoHuggy:582609341572448284>`);
	} else if (mention.id === msg.author.id) {
		sendGif(msg, img, `${msg.author} hugged themselves!`);
	} else {
		let bot = msg.mentions.members.get(cli.discordCli.user.id);
		let rnd = bot ? Math.round(Math.random()*(userq.hug.length-1)) : null;
		sendGif(msg, img, `${msg.author} hugged ${msg.mentions.members.map(v => v.toString()).reduce((v,vv,i,arr) => {return i===arr.length-1?`${v} and ${vv}`:`${v}, ${vv}`;})}! <:peepoHuggy:582609341572448284>${bot?"\n\n"+bot.toString()+": " +userq.hug[rnd]:""}`);
	}
}, {
    desc: "Get and recieve cuddles",
    tags: ["gifs", "images", "love"],
    args: [{name: "User", type: "user"}]
});

const Kemonomimi = new CommandNode("kemonomimi", async function(cli, command, msg) {
	sendGif(msg, (await neko.sfw.kemonomimi()).url);
}, {
    desc: "Returns a Kemonomimi (Human with anime ears and maybe a tail) image or gif!",
    tags: ["gifs", "images"]
});

const Kiss = new CommandNode("kiss", async function(cli, command, msg) {
	let img = (await neko.sfw.kiss()).url,
		mention = msg.mentions.members.first();
	if (!mention) {
		sendGif(msg, img, `${cli.discordCli.user} kissed ${msg.author}! ❤`);
	} else if(mention.id === cli.discordCli.user.id) {
		let rnd = Math.round(Math.random()*(userq.kiss.length-1));
		sendGif(msg, img, `${msg.author} kissed ${mention}! ❤\n\n${mention}: ${userq.kiss[rnd]}`);
	} else if (mention.id === msg.author.id) {
		sendGif(msg, img, `${msg.author} managed to kiss themselves! An amazing feat! ❤`);
	} else {
		sendGif(msg, img, `${msg.author} kissed ${mention}! ❤`);
	}
}, {
    desc: "Get and recieve kisses",
    tags: ["gifs", "images", "love"],
    args: [{name: "User", type: "user"}]
});

const Lizard = new CommandNode("lizard", async function(cli, command, msg) {
	sendGif(msg, (await neko.sfw.lizard()).url);
}, {
    desc: "Returns a lizard!",
    tags: ["gifs", "images", "reptile", "lizard"]
});

const Meow = new CommandNode("meow", async function(cli, command, msg) {
	sendGif(msg, (await neko.sfw.meow()).url);
}, {
    name: "Kitty",
    desc: "Returns a kitty cat!",
    tags: ["gifs", "images", "nekos", "cats"]
});

const Neko = new CommandNode("neko", async function(cli, command, msg) {
	sendGif(msg, (await neko.sfw.neko()).url);
}, {
    name: "Cat Girl",
    desc: "Returns a neko!",
    tags: ["nekos", "images"]
});

const NekoGif = new CommandNode("gif", async function(cli, command, msg) {
	sendGif(msg, (await neko.sfw.nekoGif()).url);
}, {
    name: "Neko GIF",
    desc: "Returns a neko gif!",
    tags: ["nekos", "gifs"]
});

const Pat = new CommandNode("pat", async function(cli, command, msg) {
	let img = (await neko.sfw.pat()).url,
		mention = msg.mentions.members.first();
	if (!mention) {
		sendGif(msg, img, `${cli.discordCli.user} patted ${msg.author} on the head~!`);
	} else if(mention.id === cli.discordCli.user.id) {
		let rnd = Math.round(Math.random()*(userq.pat.length-1));
		sendGif(msg, img, `${msg.author} patted ${mention} on the head~!\n\n${mention}: ${userq.pat[rnd]}`);
	} else if (mention.id === msg.author.id) {
		sendGif(msg, img, `${msg.author} patted themselves on the head... Now... That's just sad!`);
	} else {
		sendGif(msg, img, `${msg.author} patted ${mention} on the head~!`);
	}
}, {
    desc: "Get patted, or pat someone",
    tags: ["gifs", "images", "comfy"],
    args: [{name: "User", type: "user"}]
});

const Poke = new CommandNode("poke", async function(cli, command, msg) {
	let img = (await neko.sfw.poke()).url,
		mention = msg.mentions.members.first();
	if (!mention || (mention && mention.id === msg.author.id)) {
		sendGif(msg, img, `${msg.author} poked themselves for some strange reason...`);
	} else if(mention.id === cli.discordCli.user.id) {
		let rnd = Math.round(Math.random()*(userq.poke.length-1));
		sendGif(msg, img, `${msg.author} poked ${mention}...\n\n${mention}: ${userq.poke[rnd]}`);
	} else {
		sendGif(msg, img, `${msg.author} poked ${mention}...`);
	}
}, {
    desc: "Annoy you and your friends",
    tags: ["gifs", "images", "annoying"],
    args: [{name: "User", type: "user"}]
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
    desc: "Get a slap... Or slap someone! O.O",
    tags: ["gifs", "images", "pain"],
    args: [{name: "User", type: "user"}]
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
    desc: "Get a smug face or throw it towards someone!",
    tags: ["gifs", "images"],
    args: [{name: "User", type: "user"}]
});

const Tenor = new CommandNode("tenor", async function(cli, command, msg) {	
	const GifAmount = 10;

	if(command.Args.length > 0) {
        let str = "";
        command.Args.forEach((arg, i) => {
            str += `${i > 0 ? " " : ""}${arg.Value}`;
        });

        fetch(`https://api.tenor.com/v1/search?q=${str}&key=D02YZMVHAWZR&locale=en_US&contentfilter=medium&mediafilter=minimal&limit=${GifAmount}`)
        .then(res => { return res.json(); })
        .then(res => {
			let results = res.results;
			if(results.length === 1)
				sendGif(msg, results[0].media[0].gif.url, `**Result of:** ${str}`, "https://tenor.com/");
			else if(results.length > 1) {
				let rnd = Math.round(Math.random()*(results.length-1));
				sendGif(msg, results[rnd].media[0].gif.url, `**Result of:** ${str}`, "https://tenor.com/");
			}
			else msg.reply("No GIF was found... Sorry! ;_;");
		}).catch(err => {msg.reply("Sorry! An error seems to have occured!"); });
	} else {
        fetch(`https://api.tenor.com/v1/trending?key=D02YZMVHAWZR&locale=en_US&contentfilter=medium&mediafilter=minimal&limit=${GifAmount}`)
        .then(res => { return res.json(); })
        .then(res => {
			let results = res.results;
			if(results.length === 1)
				sendGif(msg, results[0].media[0].gif.url, "Currently trending");
			else if(results.length > 1) {
				let rnd = Math.round(Math.random()*(results.length-1));
				sendGif(msg, results[rnd].media[0].gif.url, `**Nº${rnd+1}** currently trending`, "https://tenor.com/");
			}
			else msg.reply("No GIF was found... Sorry! ;_;");
		}).catch(err => {msg.reply("Sorry! An error seems to have occured!"); });
	}
}, {
    desc: "Get the first trending GIF or search for something on Tenor.",
    tags: ["gifs"]
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
    desc: "Be tickled or tickle someone",
    tags: ["gifs", "images", "kawaii"],
    args: [{name: "User", type: "user"}]
});

const Woof = new CommandNode("woof", async function(cli, command, msg) {
	sendGif(msg, (await neko.sfw.woof()).url);
}, {
    name: "Doggo",
    desc: "Returns a doggo!",
    tags: ["gifs", "images"]
});

// NSFW Commands
const NSFWFeet = new CommandNode("feet", async (cli, command, msg) => {
	let img = (await neko.nsfw.feet()).url;
	sendGif(msg, img);
}, {
    desc: "Returns foot hentai!",
    tags: ["image"],
    nsfw: true
});

const NSFWFeetGif = new CommandNode("gif", async (cli, command, msg) => {
	let img = (await neko.nsfw.feetGif()).url;
	sendGif(msg, img);
}, {
    name: "Feet GIF",
    desc: "Returns foot hentai gifs!",
    tags: ["gif"],
    nsfw: true
});

const NSFWFemdom = new CommandNode("femdom", async (cli, command, msg) => {
	let img = (await neko.nsfw.femdom()).url;
	sendGif(msg, img);
}, {
    desc: "Returns femdom hentai!",
    tags: ["image"],
    nsfw: true
});

const NSFWAnal = new CommandNode("anal", async (cli, command, msg) => {
	let img = (await neko.nsfw.anal()).url;
	sendGif(msg, img);
}, {
    desc: "Returns anal hentai!",
    tags: ["gif"],
    nsfw: true
});

const NSFWBJ = new CommandNode("bj", async (cli, command, msg) => {
	let img = (await neko.nsfw.blowJob()).url;
	sendGif(msg, img);
}, {
    name: "Blowjob",
    desc: "Returns blowjob hentai!",
    tags: ["image"],
    nsfw: true
});

const NSFWBJGif = new CommandNode("gif", async (cli, command, msg) => {
	let img = (await neko.nsfw.bJ()).url;
	sendGif(msg, img);
}, {
    name: "Blowjob GIF",
    desc: "Returns blowjob hentai gifs!",
    tags: ["gif"],
    nsfw: true
});

const NSFWClassic = new CommandNode("classic", async (cli, command, msg) => {
	let img = (await neko.nsfw.classic()).url;
	sendGif(msg, img);
}, {
    desc: "Returns classic hentai!",
    tags: ["gif"],
    nsfw: true
});

const NSFWCum = new CommandNode("cum", async (cli, command, msg) => {
	let img = (await neko.nsfw.cumArts()).url;
	sendGif(msg, img);
}, {
    desc: "Returns cum filled hentai!",
    tags: ["image"],
    nsfw: true
});

const NSFWCumGif = new CommandNode("gif", async (cli, command, msg) => {
	let img = (await neko.nsfw.cumsluts()).url;
	sendGif(msg, img);
}, {
    name: "Cum GIF",
    desc: "Returns cum filled hentai gifs!",
    tags: ["gif"],
    nsfw: true
});

const NSFWFuta = new CommandNode("futa", async (cli, command, msg) => {
	let img = (await neko.nsfw.futanari()).url;
	sendGif(msg, img);
}, {
    desc: "Returns futa hentai!",
    tags: ["image"],
    nsfw: true
});

const NSFWSoloGirl = new CommandNode("solo-girl", async (cli, command, msg) => {
	let img = (await neko.nsfw.girlSolo()).url;
	sendGif(msg, img);
}, {
    name: "Solo Girl",
    desc: "Returns solo girl hentai!",
    tags: ["image"],
    nsfw: true
});

const NSFWSoloGirlGif = new CommandNode("gif", async (cli, command, msg) => {
	let img = (await neko.nsfw.girlSoloGif()).url;
	sendGif(msg, img);
}, {
    name: "Solo Girl GIF",
    desc: "Returns solo girl hentai gif!",
    tags: ["gif"],
    nsfw: true
});

const NSFWHolo = new CommandNode("holo", async (cli, command, msg) => {
	let img = (await neko.nsfw.holo()).url;
	sendGif(msg, img);
}, {
    desc: "Returns holo hentai!",
    tags: ["image"],
    nsfw: true
});

const NSFWKemonomimi = new CommandNode("kemonomimi", async (cli, command, msg) => {
	let img = (await neko.nsfw.kemonomimi()).url;
	sendGif(msg, img);
}, {
    desc: "Returns kemonomimi hentai!",
    tags: ["image"],
    nsfw: true
});

const NSFWKeta = new CommandNode("keta", async (cli, command, msg) => {
	let img = (await neko.nsfw.keta()).url;
	sendGif(msg, img);
}, {
    desc: "Returns keta hentai!",
    tags: ["image"],
    nsfw: true
});

const NSFWKitsune = new CommandNode("kitsune", async (cli, command, msg) => {
	let img = (await neko.nsfw.kitsune()).url;
	sendGif(msg, img);
}, {
    desc: "Returns kitsune hentai!",
    tags: ["image"],
    nsfw: true
});

const NSFWKuni = new CommandNode("kuni", async (cli, command, msg) => {
	let img = (await neko.nsfw.kuni()).url;
	sendGif(msg, img);
}, {
    desc: "Returns kuni hentai!",
    tags: ["image"],
    nsfw: true
});

const NSFWYuri = new CommandNode("yuri", async (cli, command, msg) => {
	let img = (await neko.nsfw.yuri()).url;
	sendGif(msg, img);
}, {
    desc: "Returns yuri hentai!",
    tags: ["image"],
    nsfw: true
});

const NSFWYuriGif = new CommandNode("gif", async (cli, command, msg) => {
	let img = (await neko.nsfw.lesbian()).url;
	sendGif(msg, img);
}, {
    name: "Yuri GIF",
    desc: "Returns yuri hentai gif!",
    tags: ["gif"],
    nsfw: true
});

const NSFWNeko = new CommandNode("neko", async (cli, command, msg) => {
	let img = (await neko.nsfw.neko()).url;
	sendGif(msg, img);
}, {
    desc: "Returns neko hentai!",
    tags: ["image"],
    nsfw: true
});

const NSFWNekoGif = new CommandNode("gif", async (cli, command, msg) => {
	let img = (await neko.nsfw.nekoGif()).url;
	sendGif(msg, img);
}, {
    name: "Neko GIF",
    desc: "Returns neko hentai gif!",
    tags: ["gif"],
    nsfw: true
});

const NSFWPussy = new CommandNode("pussy", async (cli, command, msg) => {
	let img = (await neko.nsfw.pussyArt()).url;
	sendGif(msg, img);
}, {
    desc: "Returns pussy hentai!",
    tags: ["image"],
    nsfw: true
});

const NSFWPussyGif1 = new CommandNode("gif", async (cli, command, msg) => {
	let img = (await neko.nsfw.pussy()).url;
	sendGif(msg, img);
}, {
    name: "Pussy GIF (1)",
    desc: "Returns pussy hentai gif!",
    tags: ["gif"],
    nsfw: true
});

const NSFWPussyGif2 = new CommandNode("gif-2", async (cli, command, msg) => {
	let img = (await neko.nsfw.pussyWankGif()).url;
	sendGif(msg, img);
}, {
    name: "Pussy GIF (2)",
    desc: "Returns pussy hentai gif!",
    tags: ["gif"],
    nsfw: true
});

const NSFWBoobs = new CommandNode("boobs", async (cli, command, msg) => {
	let img = (await neko.nsfw.tits()).url;
	sendGif(msg, img);
}, {
    desc: "Returns boobs hentai!",
    tags: ["image"],
    nsfw: true
});

const NSFWBoobsGif = new CommandNode("gif", async (cli, command, msg) => {
	let img = (await neko.nsfw.boobs()).url;
	sendGif(msg, img);
}, {
    name: "Boobs GIF",
    desc: "Returns boobs hentai gif!",
    tags: ["gif"],
    nsfw: true
});

const NSFWTrap = new CommandNode("trap", async (cli, command, msg) => {
	let img = (await neko.nsfw.trap()).url;
	sendGif(msg, img);
}, {
    desc: "Returns trap hentai!",
    tags: ["image"],
    nsfw: true
});

const NSFWAvatar = new CommandNode("avatar", async (cli, command, msg) => {
	let img = (await neko.nsfw.avatar()).url;
	sendGif(msg, img);
}, {
    desc: "Returns a hentai avatar!",
    tags: ["image"],
    nsfw: true
});

const NSFWGif = new CommandNode("gif", async (cli, command, msg) => {
	let img = (await neko.nsfw.randomHentaiGif()).url;
	sendGif(msg, img);
}, {
    name: "NSFW GIF",
    desc: "Returns a random hentai gif!",
    tags: ["gif"],
    nsfw: true
});


// NSFW Ero Commands
const NSFWEro = new CommandNode("ero", async (cli, command, msg) => {
	let img = (await neko.nsfw.ero()).url;
	sendGif(msg, img);
}, {
    name: "Erotica",
    desc: "Returns random erotica!",
    tags: ["image"],
    nsfw: true
});

const NSFWEroFeet = new CommandNode("feet", async (cli, command, msg) => {
	let img = (await neko.nsfw.eroFeet()).url;
	sendGif(msg, img);
}, {
    name: "Ero Feet",
    desc: "Returns random foot erotica!",
    tags: ["image"],
    nsfw: true
});

const NSFWEroNeko = new CommandNode("neko", async (cli, command, msg) => {
	let img = (await neko.nsfw.eroNeko()).url;
	sendGif(msg, img);
}, {
    name: "Ero Neko",
    desc: "Returns random neko erotica!",
    tags: ["image"],
    nsfw: true
});

const NSFWEroYuri = new CommandNode("yuri", async (cli, command, msg) => {
	let img = (await neko.nsfw.eroYuri()).url;
	sendGif(msg, img);
}, {
    name: "Ero Yuri",
    desc: "Returns random yuri erotica!",
    nsfw: true
});

const NSFWEroKemonomimi = new CommandNode("kemono", async (cli, command, msg) => {
	let img = (await neko.nsfw.eroKemonomimi()).url;
	sendGif(msg, img);
}, {
    name: "Ero Kemonomimi",
    desc: "Returns random kemonomimi erotica!",
    tags: ["image"],
    nsfw: true
});

const NSFWEroKitsune = new CommandNode("kitsune", async (cli, command, msg) => {
	let img = (await neko.nsfw.eroKitsune()).url;
	sendGif(msg, img);
}, {
    name: "Ero Kitsune",
    desc: "Returns random kitsune erotica!",
    tags: ["image"],
    nsfw: true
});

const NSFWEroHolo = new CommandNode("holo", async (cli, command, msg) => {
	let img = (await neko.nsfw.holoEro()).url;
	sendGif(msg, img);
}, {
    name: "Ero Holo",
    desc: "Returns random holo erotica!",
    tags: ["image"],
    nsfw: true
});


PlsGroup.addChild(PlsNSFWGroup);
PlsGroup.addChild(Baka);
PlsGroup.addChild(FoxGirl);
PlsGroup.addChild(Holo);
PlsGroup.addChild(Hug);
PlsGroup.addChild(new AliasNode("cuddle", Hug));
PlsGroup.addChild(Kemonomimi);
PlsGroup.addChild(new AliasNode("kemono", Kemonomimi));
PlsGroup.addChild(Kiss);
PlsGroup.addChild(Lizard);
PlsGroup.addChild(Meow);
PlsGroup.addChild(Neko);
PlsGroup.addChild(Pat);
PlsGroup.addChild(Poke);
PlsGroup.addChild(Slap);
PlsGroup.addChild(Smug);
PlsGroup.addChild(Tenor);
PlsGroup.addChild(new AliasNode("gif", Tenor));
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
PlsNSFWGroup.addChild(new AliasNode("kemono", NSFWKemonomimi));
PlsNSFWGroup.addChild(NSFWKeta);
PlsNSFWGroup.addChild(NSFWNeko);
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

module.exports = function (cli, help) {
    cli.registerNode(PlsGroup, "!");
    cli.registerNode(new AliasNode("p", PlsGroup), "!");
};