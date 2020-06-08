const {Nodes: {DataNode, CommandNode, AliasNode}} = require("framecord");

const txtNode = new DataNode("text", {
    name: "Text",
    desc: "Text related commands",
    tags: [],
    nsfw: false
});

String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
};

function capitalizeIf(word, result) {
    let char = word.charAt(0);

    if(char === char.toUpperCase())
        result = result.charAt(0).toUpperCase() + result.substr(1);

    return result;
}

function owoify(arr) {
    let res = [];
    for (let i = 0; i < arr.length; i++) {
        const text = arr[i].Value;
        let word = text;
        
        switch (text.toLowerCase()) {
            case "cute":
                word = capitalizeIf(text, "kawaii");
                break;

            case "cute!":
                word = capitalizeIf(text, "kawaii!");
                break;

            case "sorry":
                word = capitalizeIf(text, "sumimasen");
                break;

            case "sorry!":
                word = capitalizeIf(text, "sumimasen!");
                break;

            case "small":
                word = capitalizeIf(text, "smow");
                break;

            case "small!":
                word = capitalizeIf(text, "smow!");
                break;

            case "heart":
                word = capitalizeIf(text, "kokowo");
                break;

            case "heart!":
                word = capitalizeIf(text, "kokowo!");
                break;

            case "impossible":
                word = capitalizeIf(text, "masaka");
                break;

            case "impossible!":
            word = capitalizeIf(text, "masaka!");
            break;

            case "indeed":
                word = capitalizeIf(text, "naruhodo");
                break;

            case "indeed!":
            word = capitalizeIf(text, "naruhodo!");
            break;

            case "ok":
            case "o.k.":
                word = capitalizeIf(text, "daijoubu");
                break;

            case "ok!":
            case "o.k.!":
                word = capitalizeIf(text, "daijoubu!");
                break;

            case "stupid":
            case "idiot":
            case "retarded":
            case "retard":
                word = capitalizeIf(text, "baka");
                break;

            case "stupid!":
            case "idiot!":
            case "retarded!":
            case "retard!":
                word = capitalizeIf(text, "baka!");
                break;

            case "brother":
            case "bro":
                word = capitalizeIf(text, "onii-chan");
                break;

            case "brother!":
            case "bro!":
                word = capitalizeIf(text, "onii-chan!");
                break;

            case "sister":
            case "sis":
                word = capitalizeIf(text, "onee-chan");
                break;
            
            case "sister!":
            case "sis!":
                word = capitalizeIf(text, "onee-chan!");
                break;

            case "jump":
                word = capitalizeIf(text, "pounce");
                break;

            case "hi":
            case "hiya":
            case "hey":
                word = capitalizeIf(text, "hai");
                break;

            case "hi!":
            case "hiya!":
            case "hey!":
                word = capitalizeIf(text, "hai x3!");
                break;

            case "dick":
            case "cock":
            case "penis":
            case "penor":
            case "baby-maker":
            case "dingus":
            case "dong":
            case "schlong":
            case "willy":
            case "wiener":
            case "manhood":
                word = capitalizeIf(text, "fun stick");
                break;

            case "dick!":
            case "cock!":
            case "penis!":
            case "penor!":
            case "baby-maker!":
            case "dingus!":
            case "dong!":
            case "schlong!":
            case "willy!":
            case "wiener!":
            case "manhood!":
                word = capitalizeIf(text, "fun stick!");
                break;
            
            case "jumps":
                word = capitalizeIf(text, "pounces");
                break;

            case "you":
                word = capitalizeIf(text, "u");
                break;

            case "😳":
            case "owo":
            case ":3":
                word = "OwO";
                break;

            case "☺":
            case "uwu":
                word = "UwU";
                break;

            case "😊":
            case "😄":
            case "^^":
            case "^w^":
            case ":D":
                word = "^w^";
                break;

            case "😆":
            case "><":
            case ">.<":
            case ">w<":
                word = ">w<";
                break;

            case ";_;":
            case ";;_;;":
            case ";w;":
            case ";;w;;":
            case ";(":
            case "😿":
            case "😭":
            case "😢":
                word = ";w;";
                break;

            case "xd":
            case "x3":
            case "lul":
            case "lol":
                word = "X3";
                break;
        
            default:
                word = anify(text);
                break;
        }

        res.push(word);
    }

    return res.join(" ");
}

function anify(word) {
    return word.replaceAll("r", "w").replaceAll("R", "W").replaceAll("L", "W").replaceAll("l", "w").replaceAll("Ww", "W").replaceAll("ww", "w", true).replaceAll("No", "Nyo").replaceAll("no", "nyo", true).replaceAll("ye", "nye").replaceAll("Ye", "Nye", true);
}

const owoifyNode = new CommandNode("owoify", (cli, command, msg) => {
    msg.channel.send(owoify(command.Args.filter((arg) => { return arg.Type === "string"; })));
}, {
    name: "OwOify",
    desc: "OwOify your text!",
    args: [{name: "Text", type: "string", optional: false}]
});

const expNode = new CommandNode("expanded", (cli, command, msg) => {
    let str = "";
    command.Args.filter((arg) => { return arg.Type === "string"; }).forEach((arg, i, arr) => {
        let exp = arg.Value.toUpperCase().replace(/\s/g, "·").replace(/A/g, "Ａ").replace(/B/g, "Ｂ").replace(/C/g, "Ｃ").replace(/D/g, "Ｄ").replace(/E/g, "Ｅ").replace(/F/g, "Ｆ").replace(/G/g, "Ｇ").replace(/H/g, "Ｈ").replace(/I/g, "Ｉ").replace(/J/g, "Ｊ").replace(/K/g, "Ｋ").replace(/L/g, "Ｌ").replace(/M/g, "Ｍ").replace(/N/g, "Ｎ").replace(/O/g, "Ｏ").replace(/P/g, "Ｐ").replace(/Q/g, "Ｑ").replace(/R/g, "Ｒ").replace(/S/g, "Ｓ").replace(/T/g, "Ｔ").replace(/U/g, "Ｕ").replace(/V/g, "Ｖ").replace(/W/g, "Ｗ").replace(/X/g, "Ｘ").replace(/Y/g, "Ｙ").replace(/Z/g, "Ｚ").replace(/!/g, "！").replace(/\?/g, "？");
        
        for (let ii = 0; ii < exp.length; ii++) {
            str += exp[ii] + (ii < exp.length-1 || i < arr.length-1 ? " " : "");
        }

        if(i < arr.length-1) str += "· ";
    });

    msg.channel.send(str);
}, {
    name: "E X P A N D E D",
    desc: "E X P A N D your text!",
    args: [{name: "Text", type: "string", optional: false}]
});

const testNode = new CommandNode("test", (cli, command, msg) => {
    msg.channel.send(command.Args.join(" "));
}, {
    name: "Testing",
    desc: "Test",
    args: ["Args"]
});

txtNode.addChild(owoifyNode);
txtNode.addChild(new AliasNode("uwutxt", owoifyNode));
txtNode.addChild(new AliasNode("owo", owoifyNode));
txtNode.addChild(new AliasNode("uwu", owoifyNode));
txtNode.addChild(expNode);
txtNode.addChild(new AliasNode("exp", expNode));
txtNode.addChild(new AliasNode("expand", expNode));
txtNode.addChild(new AliasNode("enlarge", expNode));
txtNode.addChild(testNode);

module.exports = (client) => {
    client.registerNode(txtNode, "!");
    client.registerNode(new AliasNode("txt", txtNode), "!");
};