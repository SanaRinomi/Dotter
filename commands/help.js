const {Nodes: {CommandNode}, ListMessage} = require("framecord");
const Mustache = require("mustache");
const HelpAmount = 6;

function getNode(parent, args) {
    let currentNode = parent;
    if(args.length > 0) {
        for (let i = 0; i < args.length; i++) {
            const nodeID = args[i];
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
        type: parent.Type === "command" ? "Command" : "Group",
        desc: parent.Description,
        hastags: parent.Tags.length > 0 ? true : false,
        tags: parent.Tags,
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
                    ctype: page[i].Type === "command" ? "Command" : "Group"
                });
            }
            return arr;
        },
        index: index+1,
        limit: limit+1
    };

    const render = Mustache.render(
`\`\`\`md
# Help for: {{name}}
* Path: {{path}}

## Description
{{desc}}

## Info
* ID: {{id}}
* Name: {{name}}
* Type: {{type}}
* NSFW: {{nsfw}}
{{#hastags}}* Tags:{{/hastags}}
{{#tags}}
    * {{.}}
{{/tags}}

{{#haschildren}}## Children ({{index}}/{{limit}}){{/haschildren}}
{{#children}}
* \`{{path}}{{cid}}\` - {{cname}} ({{ctype}})
{{/children}}
\`\`\``
        , data);    
  
    return render;
}

const HelpNode = new CommandNode("help", async (cli, command, msg) => {
    let node = getNode(command.node.Parent, command.args);
    const commArr = command.commands.slice(1, command.commands.length - 2);
    const path = `${command.prefix}${command.commands[0]}${commArr.length ? commArr.join(" ") + " " : ""}${command.args.length ? command.args.join(" ") + " " : ""}`;
    if(!node) {
        msg.reply("We couldn't find a node with that value!");
        return;
    }

    if(node.IsNSFW && !msg.channel.nsfw) {
        msg.reply("Sorry! You need to move to a NSFW channel to see this!");
        return;
    }

    const children = node.HasChildren ? msg.channel.nsfw ? node.Children : node.Children.filter(node => !node.IsNSFW) : null;

    if(children && children.length > HelpAmount){
        const limit = Math.ceil(children.length / HelpAmount)-1;
        const list = new ListMessage(async (index) => {
            return help(node, children, path, index, HelpAmount, limit);
        });
        list.IndexLimit = limit;
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

module.exports = (client) => { 
    client.registerNode(HelpNode, "!");
};