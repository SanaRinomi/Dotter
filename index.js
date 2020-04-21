const {Client, Nodes: {DataNode}, Events: {Event}} = require("framecord"),
    Config = require("./config.json"),
    path = require("path"),
    fs = require("fs");

const DotterClient = new Client(Config.testToken, {
    name: "Dotter",
    description: "Your one and only bot for Discord.",
    prefix: "dn"
});

DotterClient.events.addEvent(new Event("command.notInNSFW"));
DotterClient.events.addEvent(new Event("command.nodeNotCommand"));
DotterClient.events.addListener("command.notInNSFW", (data) => {
    data.msg.reply(`You must use \`${data.command.commands[data.command.commands.length-1]}\` in a NSFW channel.`);
});

const UserBase = new DataNode("!", {
    name: "Dotter",
    description: "Your one and only bot for Discord.",
    tags: [],
    nsfw: false
});

const AdminBase = new DataNode("@", {
    name: "Dotter Admin",
    description: "Dotter's admin commands.",
    tags: ["Admin"],
    nsfw: false
});

DotterClient.registerNode(UserBase);
DotterClient.registerNode(AdminBase);

function loadModules(startPath = "./commands") {
    let paths = [startPath];

    for (let i = 0; i < paths.length; i++) {
        const currPath = path.join(__dirname, paths[i]);
        fs.readdirSync(currPath).forEach(function(file) {    
            if(file.endsWith(".js")){
                delete require.cache[require.resolve(path.join(currPath, file))];
                const moduleData = require(path.join(currPath, file));
                DotterClient.registerNode(moduleData.node, moduleData.path);
            }
            else {
                paths.push(path.join(paths[i], file));
            }
        });
    }
}

loadModules();

DotterClient.login();