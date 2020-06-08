const fetch = require("node-fetch"), 
    {Nodes: {CommandNode, AliasNode}, ReactionMessage} = require("framecord");

const fact = (name, fact, site) => {
    return `\`\`\`md
# Random${name ? " " + name : ""} Fact

**${fact}**

From: [${site.name}](${site.url})\`\`\``;
};

const facts = new CommandNode("facts", async function(cli, command, msg) {
    const getFact = async () => {
        const req = async () => {
            const res = await fetch("https://randomuselessfact.appspot.com/random.json?language=en");
            if(!res.ok)
                return null;
            
            return await res.json();
        };
        
        while(true) {
            const json = await req();
            if(!json) return "Something went wrong!";
            if(json.source !== "NEON")
                return fact(null, json.text ? json.text : json.fact, {name: json.source, url: json.source_url});
        }
    };

	const message = new ReactionMessage(msg.author.id, async (obj, reaction, deleted) => {
        obj.Message.edit(await getFact());
    }, ["🔁"], false, undefined, 60000);
    message.onEnd = () => {};
    message.send(msg.channel, await getFact());
}, {
    name: "Random Facts",
    desc: "Some useless random facts!",
    tags: ["information"]
});

const catFacts = new CommandNode("cats", async function(cli, command, msg) {
    const getFact = async () => {
        const res = await fetch("https://catfact.ninja/fact?max_length=1000");
        if(!res.ok)
            return "Something went wrong!";
        
        const json = await res.json();
        
        return fact("Cat", json.text ? json.text : json.fact, {name: "Cat Facts API", url: "https://catfact.ninja/"});
    };

	const message = new ReactionMessage(msg.author.id, async (obj, reaction, deleted) => {
        obj.Message.edit(await getFact());
    }, ["🔁"], false, undefined, 60000);
    message.onEnd = () => {};
    message.send(msg.channel, await getFact());
}, {
    name: "Cat Facts",
    desc: "Some random cat facts!",
    tags: ["information" ,"kitties", "cat"]
});

// const todayFacts = new CommandNode("today", async function(cli, command, msg) {
//     const getFact = async () => {
//         const res = await fetch("http://api.fungenerators.com/fact/onthisday/event",
//         {
//             headers: {
//                 accept: ""
//             }
//         });
//         if(!res.ok)
//             return "Something went wrong!";
        
//         const json = await res.json();
        
//         return fact("event that happened today", json.content.event, {name: "Fun Generators", url: "https://fungenerators.com/"});
//     };

// 	const message = new ReactionMessage(async (obj, reaction, deleted) => {
//         obj.Message.edit(await getFact());
//     }, ["🔁"]);
//     message.send(msg.channel, await getFact());
// }, {
//     name: "Something Happened Today",
//     desc: "Random event that happened today",
//     tags: ["information", "date"],
//     nsfw: false
// });

facts.addChild(catFacts);
facts.addChild(new AliasNode("kitty", catFacts));
facts.addChild(new AliasNode("cat", catFacts));
// facts.addChild(todayFacts);

module.exports = (client) => {
    client.registerNode(facts, "!fun");
    client.registerNode(new AliasNode("fact", facts), "!fun");
};