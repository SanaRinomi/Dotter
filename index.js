const {Client, Nodes: {DataNode, AliasNode}} = require("framecord"),
    Config = require("./config.json"),
    path = require("path"),
    presenceChange = require("./other/discordPresence"),
    fs = require("fs");

const DotterClient = new Client(Config.discordToken, "dn", (cli) => {
    console.log(`Logged in as ${cli.discordCli.user.tag}`);
});

DotterClient.on("nodeNotInNSFW", (node, command, msg) => {
    msg.reply(`You must use \`${command.commands[command.commands.length-1]}\` in a NSFW channel.`);
});

const UserBase = new DataNode("!", {
    name: "Dotter",
    desc: "Your one and only bot for Discord.",
    tags: [],
    nsfw: false
});

const DNDBase = new DataNode("&", {
    name: "Dotter D&D",
    desc: "Dotter's D&D Commands",
    tags: ["Roleplay"],
    nsfw: false
});

const AdminBase = new DataNode("@", {
    name: "Dotter Admin",
    desc: "Dotter's admin commands.",
    tags: ["Admin"],
    nsfw: false
});

DotterClient.registerNode(UserBase);
DotterClient.registerNode(new AliasNode(".", UserBase));
DotterClient.registerNode(DNDBase);
DotterClient.registerNode(AdminBase);
DotterClient.registerNode(new AliasNode("$", AdminBase));

const helpCommand = require("./other/help");

presenceChange(DotterClient);

function loadModules(startPath = "./commands") {
    let paths = [startPath];

    DotterClient.registerNode(helpCommand, "!");
    DotterClient.registerNode(new AliasNode("h", helpCommand), "!");

    const helpDnDClone = helpCommand.clone();
    DotterClient.registerNode(helpDnDClone, "&");
    DotterClient.registerNode(new AliasNode("h", helpDnDClone), "&");

    const helpAdminClone = helpCommand.clone();
    DotterClient.registerNode(helpAdminClone, "@");
    DotterClient.registerNode(new AliasNode("h", helpAdminClone), "@");

    for (let i = 0; i < paths.length; i++) {
        const currPath = path.join(__dirname, paths[i]);
        fs.readdirSync(currPath).forEach(function(file) {    
            if(file.endsWith(".js")){
                delete require.cache[require.resolve(path.join(currPath, file))];
                const moduleData = require(path.join(currPath, file));
                if(typeof moduleData === "function")
                    moduleData(DotterClient, helpCommand.clone());
            }
            else {
                paths.push(path.join(paths[i], file));
            }
        });
    }
}

loadModules();

require("./controllers/discordEvents")(DotterClient.discordCli);

DotterClient.login();