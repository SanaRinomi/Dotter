const {Nodes: {DataNode, CommandNode, AliasNode}} = require("framecord"),
    {MessageEmbed} = require("discord.js");

const ballResponseArray = [
    "It is certain",
    "Without a doubt",
    "You may rely on it",
    "Yes definitely",
    "It is decidedly so",
    "As I see it, yes",
    "Most likely",
    "Yes",
    "Outlook good",
    "Signs point to yes",
    "Reply hazy try again",
    "Better not tell you now",
    "Ask again later",
    "Cannot predict now",
    "Concentrate and ask again",
    "Don’t count on it",
    "Outlook not so good",
    "My sources say no",
    "Very doubtful",
    "My reply is no"
];

const gutterArray = [
    "Oh no! The coin fell down the drain! Maybe try again?",
    "Ooooh! The coin is standing up! OwO"
];

const funNode = new DataNode("fun", {
    name: "Fun",
    desc: "Entertainment on demand!",
    tags: [],
    nsfw: false
});

const big = new CommandNode("big", (cli, command, msg) => {
    let embed = new MessageEmbed();
    
    embed.setColor(0xAD00FF);

    if (command.Args === null || command.Args.length === 0) {
        embed.setDescription(`**Avatar of** ${msg.author.username} (You)`);
        embed.setImage(msg.author.avatarURL({size: 4096}));
        msg.channel.send(embed);
    } else if(command.Args[0].Value.toLowerCase() === "guild"){
        const guildIcon = msg.guild.iconURL({size: 4096});
        
        if(guildIcon){
            embed.setDescription(`**Icon of** ${msg.guild.name}`);
            embed.setImage(guildIcon);
            msg.channel.send(embed);
        } else {
            embed.setDescription(`${msg.guild.name} **doesn't have an icon**`);
            msg.channel.send(embed);
        }
    }
    else {
        if(command.Args[0].Type === "string" || command.Args[0].Type === "unknown") 
            msg.reply("Emmm... That's not a user or an emote! :/");
        else if(command.Args[0].Type === "user") {
            let user = msg.mentions.users.first();
            if(user) {
                embed.setDescription(`**Avatar of** ${user.id !== msg.author.id ? user.username : user.username + " (You)"}`);
                embed.setImage(user.avatarURL({size: 4096}));
                msg.channel.send(embed);
            } else {
                msg.reply("Emmm... That's not a user or an emote! :/");
            }
        } else if(command.Args[0].Type === "emote" && command.Args[0].Animated) {
            embed.setDescription(`**Animated emote** ${command.Args[0].Name}`);
            embed.setImage(`https://cdn.discordapp.com/emojis/${command.Args[0].ID}.gif`);
            msg.channel.send(embed);
        } else if(command.Args[0].Type === "emote") {
            embed.setDescription(`**Emote** ${command.Args[0].Name}`);
            embed.setImage(`https://cdn.discordapp.com/emojis/${command.Args[0].ID}.png`);
            msg.channel.send(embed);
        } else {
            msg.reply("Whoops! Look like we can't get that for you...!");
        }
    }
}, {
    name: "Enlarge",
    desc: "Get a larger version of an emote or user PFP. If you write guild as the first argument, then it will return the current guild's icon.",
    tags: ["enlarge", "emotes", "emote", "image", "profile picture", "enhance", "icon", "user"],
    args:["User/Emote/\"guild\""]
});

const _8ball = new CommandNode("8ball", (cli, command, msg) => {
    const rand = Math.round(Math.random()*(ballResponseArray.length-1));
    
    msg.channel.send(`${msg.member} peers into the mystical 8ball! It's response was: \`\`\`md
# 8Ball Response

- ${ballResponseArray[rand]}
\`\`\``);
}, {
    desc: "Ask the mystic 8ball your questions! Or just put random text into it...",
    args:[{name: "Text", type: "string", optional: false}]
});

const coin = new CommandNode("coin", (cli, command, msg) => {
    const coin = command.Args.length > 0 ? command.Args[0].Value : null;

    if(coin && (coin.toLowerCase() !== "heads" && coin.toLowerCase() !== "tails")) {
        msg.reply(`Oh my! I never knew that the "${coin}" side existed!`);
        return;
    }

    const int = Math.round(Math.random()*20);
    const inti = Math.round(Math.random()*(gutterArray.length-1));
    const user = msg.member.toString();

    if(int === 0)
        msg.channel.send(gutterArray[inti]);
    else if(int <= 10)
        msg.channel.send(`Coin landed on **heads**! ${coin  
                                                        ? coin === "heads" 
                                                            ? "You guessed correctly " + user + "!"
                                                            : "No luck here today, " + user + "!"
                                                        : ""}`);
    else msg.channel.send(`Coin landed on **tails**! ${coin  
                                                        ? coin === "heads" 
                                                            ? "No luck here today, " + user + "!"
                                                            : "You guessed correctly " + user + "!"
                                                        : ""}`);
}, {
    name: "Coin Toss",
    desc: "Heads or Tails? Place your bet and flip a coin!",
    args:[{name: "Heads or Tails", type: "string"}]
});

funNode.addChild(big);
funNode.addChild(new AliasNode("enlarge", big));
funNode.addChild(new AliasNode("b", big));
funNode.addChild(new AliasNode("enhance", big));
funNode.addChild(_8ball);
funNode.addChild(new AliasNode("8b", _8ball));
funNode.addChild(coin);
funNode.addChild(new AliasNode("toss", coin));

module.exports = (client) => {
    client.registerNode(funNode, "!");
};