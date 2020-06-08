const {Nodes: {CommandNode, AliasNode}} = require("framecord"),
    now = require("performance-now");

const delay = ms => new Promise(res => setTimeout(res, ms));

const beat = async (channel, txt) => {
    await delay(1000);
    let beat = now();
    let msg = await channel.send(txt);
    msg.delete();
    return now() - beat;
};

const pingNode = new CommandNode("ping", async (cli, command, msg) => {
    let ping = await beat(msg.channel, " ᅠ ");
    msg.channel.send(`Pong! (${ping.toFixed(3)}ms)`);
});

const heartbeat = new CommandNode("heartbeat", async (cli, command, msg) => {
    let arr = [];

    for (let i = 0; i < 6; i++) {
        arr.push(Number(await beat(msg.channel, "💓 Beep!")));
    }

    const min = Math.min.apply(Math, arr), max = Math.max.apply(Math, arr);
    
    const avg = arr.reduce((a,b) => (a+b)) / arr.length;
    
    msg.channel.send(`💜 Beeeeep! Average ping of ${avg.toFixed(3)}ms ( ⬇ Min: ${min.toFixed(3)}ms / Max: ${max.toFixed(3)}ms ⬆ )`);
});

pingNode.addChild(heartbeat);
pingNode.addChild(new AliasNode("beat", heartbeat));

module.exports = (client) => {
    client.registerNode(pingNode, "!");
};