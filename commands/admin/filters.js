const {Nodes: {CommandNode, AliasNode}, ConfirmationMessage} = require("framecord"),
    {Permissions: {FLAGS}} = require("discord.js"),
    DB = require("../../controllers/dbMain");

function filterData(data) {
    if(!data)
        data = {
            enabled: false,
            common: false,
            words: [],
            black_list_mode: true,
            channel_list: [],
            emoji_limit: 0
        };
    return data;
}

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
    let filter = await DB.guild.getFilters(msg.guild.id);
    if(filter.success && filter.data)
        msg.channel.send(`\`\`\`md
# Filter Settings
* Filter Enabled? ${filter.data.enabled ? "Yes" : "No"}
* Filter Common Swear Words? ${filter.data.common ? "Yes" : "No"}
* Filtered Words: ${filter.data.words ? filter.data.words.join(", ") : "None"}
* Emoji Limit: ${filter.data.emoji_limit ? filter.data.emoji_limit : "None"}
\`\`\``);
    else msg.channel.send("Failed to get any data...!");
}, {
    name: "Filters",
    desc: "Get filter settings",
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const filterCommon = new CommandNode("common", (cli, comm, msg) => {
    let conf = new ConfirmationMessage(msg.author.id, async (obj) => {
        await DB.guild.addGuild(msg.guild.id);
        DB.guild.getFilters(msg.guild.id).then(welcome => {
            if(!welcome.success) {
                obj.Message.edit("Filters failed to retrieve data!");
                return;
            }

            let data = filterData(welcome.data);
            data.common = comm.Args[0].Value;

            DB.guild.updateFilters(msg.guild.id, data).then(v => {
                if(v) obj.Message.edit("Filters set!");
                else obj.Message.edit("Filters failed to set!");
            });
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
        await DB.guild.addGuild(msg.guild.id);
        DB.guild.getFilters(msg.guild.id).then(welcome => {
            if(!welcome.success) {
                obj.Message.edit("Filters failed to retrieve data!");
                return;
            }

            let data = filterData(welcome.data);
            data.enabled = comm.Args[0].Value;

            DB.guild.updateFilters(msg.guild.id, data).then(v => {
                if(v) obj.Message.edit("Filters set!");
                else obj.Message.edit("Filters failed to set!");
            });
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
        await DB.guild.addGuild(msg.guild.id);
        DB.guild.getFilters(msg.guild.id).then(welcome => {
            if(!welcome.success) {
                obj.Message.edit("Filters failed to retrieve data!");
                return;
            }

            let data = filterData(welcome.data);
            data.emoji_limit = comm.Args[0].Value;

            DB.guild.updateFilters(msg.guild.id, data).then(v => {
                if(v) obj.Message.edit("Filters set!");
                else obj.Message.edit("Filters failed to set!");
            });
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
    let filter = await DB.guild.getFilters(msg.guild.id);

    if(filter.success && filter.data && filter.data.words)
        msg.channel.send(`\`\`\`md
# Filter Words Settings
* Filtering: ${filter.data.words ? filter.data.words.join(", ") : "None"}
\`\`\``);
    else msg.channel.send("Failed to get any data...!");
}, {
    name: "Word Filters",
    desc: "Get word filter settings",
    perms: [FLAGS.SEND_MESSAGES, FLAGS.ADD_REACTIONS, {type: FLAGS.ADMINISTRATOR, user: true}]
});

const filterWordsAdd = new CommandNode("add", (cli, comm, msg) => {
    let vals = comm.Args.map(v => v.Value);
    let conf = new ConfirmationMessage(msg.author.id, async (obj) => {
        await DB.guild.addGuild(msg.guild.id);
        DB.guild.getFilters(msg.guild.id).then(welcome => {
            if(!welcome.success) {
                obj.Message.edit("Filters failed to retrieve data!");
                return;
            }

            let data = filterData(welcome.data);
            data.words = unique([...data.words, ...vals.map(v => v.toLowerCase())]);

            DB.guild.updateFilters(msg.guild.id, data).then(v => {
                if(v) obj.Message.edit("Filters set!");
                else obj.Message.edit("Filters failed to set!");
            });
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
        await DB.guild.addGuild(msg.guild.id);
        DB.guild.getFilters(msg.guild.id).then(welcome => {
            if(!welcome.success) {
                obj.Message.edit("Filters failed to retrieve data!");
                return;
            }

            let data = filterData(welcome.data);
            data.words = data.words.filter(v => {
                return !vals.includes(v);
            });

            DB.guild.updateFilters(msg.guild.id, data).then(v => {
                if(v) obj.Message.edit("Filters set!");
                else obj.Message.edit("Filters failed to set!");
            });
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
        await DB.guild.addGuild(msg.guild.id);
        DB.guild.getFilters(msg.guild.id).then(welcome => {
            if(!welcome.success) {
                obj.Message.edit("Filters failed to retrieve data!");
                return;
            }

            let data = filterData(welcome.data);
            data.words = [];

            DB.guild.updateFilters(msg.guild.id, data).then(v => {
                if(v) obj.Message.edit("Filters set!");
                else obj.Message.edit("Filters failed to set!");
            });
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