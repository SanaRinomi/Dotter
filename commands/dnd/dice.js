const {Nodes: {CommandNode, AliasNode}} = require("framecord");

const Dice = new CommandNode("dice", (cli, comm, msg) => {
    const amount = comm.Args[1] ? comm.Args[1].Value : 1;
    const range = comm.Args[0] ? comm.Args[0].Value > 1 ? comm.Args[0].Value-1 : 1 : 5;

    let values = [];
    for (let i = 0; i < amount; i++) {
        let val = Math.round(Math.random()*(Math.ceil(range)));
        values.push(range > 1 ? val+1 : val);  
    }

    let string = "";
    if(range < 1000 && amount > 1) {
        string += "Dice: [";
        values.forEach((value, i) => {
            if(i > 150) return;
            string += `\`${value}\`${range > 1 ? value === range+1 ? "⬆" : value === 1 ? "⬇" : "" : ""}${i < values.length-1 && i < 150 ? ", ": "]\n\n"}`;
        });
    }

    string += `**Result:** ${values.reduce((a, b) => {return a+b;})}`;
    
    msg.reply(string);
}, {
    desc: "All the dice you could need!",
    args: [{name: "Value", type: "number"}, {name: "Amount", type: "number"}]
});

module.exports = (client) => {
    client.registerNode(Dice, "&");
    client.registerNode(new AliasNode("d", Dice), "&");
    client.registerNode(Dice.clone(), "!fun");
};