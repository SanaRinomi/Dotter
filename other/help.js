const {Nodes: {CommandNode, AliasNode}, ListMessage} = require("framecord");
const Mustache = require("mustache");
const HelpAmount = 6;

function getNode(parent, args) {
    let currentNode = parent;
    if(args.length > 0) {
        for (let i = 0; i < args.length; i++) {
            const nodeID = args[i].Value;
            let node = currentNode.getChild(nodeID);
            if(node === undefined){
                return null;
            }

            currentNode = node;
        }
    }

    return currentNode;
}

function help(parent, children, path, index = 0, amount = 0, limit = 0) {
    const data = {
        id: parent.ID,
        path,
        name: parent.Name,
        type: parent.Type.charAt(0).toUpperCase() + parent.Type.slice(1).toLowerCase(),
        desc: parent.Description,
        hastags: parent.Tags.length > 0 ? true : false,
        tags: () => parent.Tags.map(val => { return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();}),
        nsfw: () => {
            return parent.IsNSFW ? "Yes" : "No";
        },
        haschildren: children ? true : false,
        children: () => {
            if(!children) return;
            let page = children.slice((index) * amount, (index+1) * amount);
            let arr = [];

            for (let i = 0; i < page.length; i++) {
                arr.push({
                    cid: page[i].ID,
                    cname: page[i].Name,
                    ctype: page[i].Type.charAt(0).toUpperCase() + page[i].Type.slice(1).toLowerCase(),
                    ctags: page[i].IsNSFW ? page[i].HasChildren ? "[🔞][+🧾]" : "[🔞]" : page[i].HasChildren ? "[+🧾]" : ""
                });
            }
            return arr;
        },
        aliases: parent.Aliases.join(", "),
        hasargs: parent.HasArgs,
        args: () => {
            if(!parent.HasArgs) return;
            let str = "";
            parent.Args.forEach(arg => {
                if(arg.optional)
                    str += `(${arg.name} *type: ${arg.type}*) `;
                else str += `[${arg.name} *type: ${arg.type}*] `;
            });

            return str;
        },
        argsreq: parent.ArgsRequired,
        index: index+1,
        limit: limit+1
    };

    const render = Mustache.render(
`\`\`\`md
# ❓ Help for: {{{name}}}
* Path: {{{path}}}{{#hasargs}}
* Args: {{{args}}}{{/hasargs}}{{#aliases}}
* Aliases: {{{aliases}}}{{/aliases}}

## 💬 Description
{{{desc}}}

## 📄 Info
* ID: {{id}}
* Name: {{{name}}}
* Type: {{type}}
* NSFW: {{nsfw}}{{#hastags}}
* Tags:{{/hastags}}{{#tags}}
  * {{{.}}}{{/tags}}{{#haschildren}}

## 🧾 Children ({{index}}/{{limit}}){{/haschildren}}{{#children}}
* \`{{{path}}}{{{cid}}}\` - {{{cname}}} ({{ctype}}) {{ctags}}{{/children}}{{#argsreq}}

**NOTE**: Required arguments are in [brakets] and optional ones in (parentheses){{/argsreq}}
\`\`\``
        , data);    
  
    return render;
}

const HelpNode = new CommandNode("help", async (cli, command, msg) => {
    let node = getNode(command.Node.Parent, command.Args); 

    if(!node) {
        msg.reply("We couldn't find a node with that value!");
        return;
    }

    if(node.Type === "alias") node = node.Target;   

    if(msg.guild && (node.IsNSFW && !msg.channel.nsfw)) {
        msg.reply("Sorry! You need to move to a NSFW channel to see this!");
        return;
    }

    const commArr = command.Commands.slice(1, command.Commands.length - 2);
    let path = `${command.Prefix}${command.Commands[0].ID}`;
    for (let i = 0; i < commArr.length; i++) {
        path += commArr[i].ID + " ";
    }

    for (let i = 0; i < command.Args.length; i++) {
        path += command.Args[i].Value + " ";
    }

    let children = node.HasChildren ?
                        msg.guild ?
                            msg.channel.nsfw ?
                                node.Children
                            : node.Children.filter(node => !node.IsNSFW)
                        : [...node.Children]
                    : null;

    if(children) {
        children = children.filter(node => node.Type !== "alias");
        children.sort((a, b) => {return a.ID > b.ID ? 1 : a.ID < b.ID ? -1 : 0;});
    }

    if(children && children.length > HelpAmount){
        const limit = Math.ceil(children.length / HelpAmount)-1;
        const list = new ListMessage(msg.author.id, async (index) => {
            return help(node, children, path, index, HelpAmount, limit);
        });
        list.IndexLimit = limit;
        list.onEnd = (obj) => {obj.Message.edit(obj.Message.content+"**Help timed out!**");};
        list.send(msg.channel);
    } else {
        msg.channel.send(help(node, children, path, 0, HelpAmount, 0));
    }

}, {
    name: "Help",
    desc: "A command to help you out!",
    tags: ["pls halp!", "reee"],
    nsfw: false
});

module.exports = HelpNode;