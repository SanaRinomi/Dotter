const {Nodes: {CommandNode, AliasNode}, ConfirmationMessage} = require("framecord"),
    {Permissions: {FLAGS}} = require("discord.js"),
    {GuildConfig} = require("../../classes/Guild");

function unique(arr) {
    var a = arr.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

const Filter = new CommandNode("filter", async (cli, command, msg) => {
    let config = await GuildConfig.fetch(msg.guild.id);
    if(config) {
        config = config.Filter;
        msg.channel.send(`\`\`\`md
# Filter Settings
* Filter Enabled? ${config.enabled ? "Yes" : "No"}
* Filter Common Swear Words? ${config.common ? "Yes" : "No"}
* Filtered Words: ${config.words ? config.words.join(", ") : "None"}
* Emoji Limit: ${config.emoji_limit ? config.emoji_limit : "None"}
\`\`\``);
    }
    else msg.channel.send("Failed to get config...!");
}, {
    name: "Filters",
    desc: "Get filter settings",
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const filterCommon = new CommandNode("common", (cli, comm, msg) => {
    let conf = new ConfirmationMessage(msg.author.id, async (obj) => {
        let config = await GuildConfig.fetch(msg.guild.id);
        
        if(config) {
            obj.Message.edit("Failed to retrieve config...!");
            return;
        }

        config.Filter = {common: comm.Args[0].Value};
        config.save().then(v => {
            if(v.success) obj.Message.edit("Filters set!");
            else obj.Message.edit("Filters failed to set!");
        });
    });
    
    conf.send(msg.channel, `Are you sure you want to ${comm.Args[0] ? "enable" : "disable"} the common swear word filter?`);
}, {
    name: "Toggle Common Swear Words",
    desc: "Toggle the common swear word filters.",
    args: [{name: "enabled", type: "boolean", optional: false}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const filterEnable = new CommandNode("enable", (cli, comm, msg) => {
    let conf = new ConfirmationMessage(msg.author.id, async (obj) => {
        let config = await GuildConfig.fetch(msg.guild.id);
        
        if(config) {
            obj.Message.edit("Failed to retrieve config...!");
            return;
        }

        config.Filter = {enabled: comm.Args[0].Value};
        config.save().then(v => {
            if(v.success) obj.Message.edit("Filters set!");
            else obj.Message.edit("Filters failed to set!");
        });
    });
    
    conf.send(msg.channel, `Are you sure you want to ${comm.Args[0] ? "enable" : "disable"} the filter?`);
}, {
    name: "Toggle Enabled",
    desc: "Toggle the filters.",
    args: [{name: "enabled", type: "boolean", optional: false}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const filterEmoji = new CommandNode("emojis", (cli, comm, msg) => {
    let conf = new ConfirmationMessage(msg.author.id, async (obj) => {
        let config = await GuildConfig.fetch(msg.guild.id);
        
        if(config) {
            obj.Message.edit("Failed to retrieve config...!");
            return;
        }

        config.Filter = {emoji_limit: comm.Args[0].Value};
        config.save().then(v => {
            if(v.success) obj.Message.edit("Filters set!");
            else obj.Message.edit("Filters failed to set!");
        });
    });
    
    conf.send(msg.channel, `Are you sure you want to ${comm.Args[0].Value ? "set the value of the emoji limit to " + comm.Args[0].Value : "disable the emoji limit"}?`);
}, {
    name: "Emoji Limit",
    desc: "Set the emoji limit. Setting it to 0 disables it.",
    args: [{name: "limit", type: "number", optional: false}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const filterWords = new CommandNode("words", async (cli, command, msg) => {
    let config = await GuildConfig.fetch(msg.guild.id);

    if(config) {
        config = config.Filter;
        msg.channel.send(`\`\`\`md
# Filter Words Settings
* Filtering: ${config.words && config.words[0] ? config.words.join(", ") : "None"}
\`\`\``);
    }
    else msg.channel.send("Failed to get any data...!");
}, {
    name: "Word Filters",
    desc: "Get word filter settings",
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const filterWordsAdd = new CommandNode("add", (cli, comm, msg) => {
    let vals = comm.Args.map(v => v.Value);
    let conf = new ConfirmationMessage(msg.author.id, async (obj) => {
        let config = await GuildConfig.fetch(msg.guild.id);
        
        if(config) {
            obj.Message.edit("Failed to retrieve config...!");
            return;
        }

        config.Filter = {words: unique([...data.words, ...vals.map(v => v.toLowerCase())])};
        config.save().then(v => {
            if(v.success) obj.Message.edit("Filters set!");
            else obj.Message.edit("Filters failed to set!");
        });
    });
    
    conf.send(msg.channel, `Are you sure you want to add ${vals.join(", ")} to the word filter?`);
}, {
    name: "Add Words",
    desc: "Add words to word filter",
    args: [{name: "word", type: "string", optional: false}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const filterWordsRemove = new CommandNode("remove", (cli, comm, msg) => {
    let vals = comm.Args.map(v => v.Value);
    let conf = new ConfirmationMessage(msg.author.id, async (obj) => {
        let config = await GuildConfig.fetch(msg.guild.id);
        
        if(config) {
            obj.Message.edit("Failed to retrieve config...!");
            return;
        }

        config.Filter = {words: data.words.filter(v => {
            return !vals.includes(v);
        })};

        config.save().then(v => {
            if(v.success) obj.Message.edit("Filters set!");
            else obj.Message.edit("Filters failed to set!");
        });
    });
    
    conf.send(msg.channel, `Are you sure you want to remove ${vals.join(", ")} from the word filter?`);
}, {
    name: "Remove Words",
    desc: "Remove words to word filter",
    args: [{name: "word", type: "string", optional: false}],
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const filterWordsReset = new CommandNode("reset", (cli, comm, msg) => {
    let conf = new ConfirmationMessage(msg.author.id, async (obj) => {
        let config = await GuildConfig.fetch(msg.guild.id);
        
        if(config) {
            obj.Message.edit("Failed to retrieve config...!");
            return;
        }

        config.Filter = {words: []};
        config.save().then(v => {
            if(v.success) obj.Message.edit("Filters set!");
            else obj.Message.edit("Filters failed to set!");
        });
    });
    
    conf.send(msg.channel, "Are you sure you want to reset the word filter?");
}, {
    name: "Reset Words",
    desc: "Reset words to word filter",
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

Filter.addChild(filterEnable);
Filter.addChild(filterCommon);
Filter.addChild(filterWords);
Filter.addChild(filterEmoji);

filterWords.addChild(filterWordsAdd);
filterWords.addChild(filterWordsRemove);
filterWords.addChild(filterWordsReset);

module.exports = (client) => { 
    client.registerNode(Filter, "@");
};