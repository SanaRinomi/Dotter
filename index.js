const {Client, Nodes: {DataNode, AliasNode}} = require("framecord"),
    Config = require("./config.json"),
    path = require("path"),
    presenceChange = require("./other/discordPresence"),
    fs = require("fs"),
    {commands} = require("./controllers/dbMain"),
    {Nodes} = require("./controllers/cache"),
    cvs = require("./controllers/canv");

const DotterClient = new Client(Config.discordToken, "dn", (cli) => {
    console.log(`Logged in as ${cli.discordCli.user.tag}`);
});

DotterClient.on("nodeNotInNSFW", (node, command, msg) => {
    msg.reply(`You must use "${command.CurrentNode.Name}" \`${command.CurrentNode.ID}\` in a NSFW channel.`);
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

function registerNodes() {
    let nodes = [{n: DotterClient.root, path: "", level: 0}];
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if(node.level > 1) commands.isCommandStored(node.path, node.n.ID).then(v => {
            let executable = node.n.Type === "command";
            let nodeData = {
                name: node.n.Name,
                description: node.n.Description,
                tags: node.n.Tags,
                aliases: node.n.Aliases,
                nsfw: node.n.IsNSFW,
                arguments: executable ? node.n.Arguments : [],
                permissions: executable ? node.n.Permissions : [],
                executable
            };
            if(Number.isInteger(v)) {
                node.n.dbID = v;
                commands.UpdateCommand(v, nodeData);
            } else commands.addCommand(node.path, node.n.ID, nodeData).then(vv => {
                if(Number.isInteger(vv)) node.n.dbID = vv;
            }).catch(err => {console.log(err.message);});
        });

        if(node.n.HasChildren)
            nodes.push(...node.n.Children.filter(v => v.Type !== "alias").map(v => {return {n:v, path: node.level > 2 ? `${node.path} ${node.n.ID}` : node.level ? node.path+node.n.ID : node.n.ID, level: node.level+1};}));
    }

    Nodes.push(...nodes);
}

loadModules();
registerNodes();

require("./controllers/discordEvents")(DotterClient.discordCli);

DotterClient.login();