const {Nodes: {DataNode}} = require("framecord");

const node = new DataNode("pls", {name: "Please", desc: "Please commands", tags: ["entertainment", "gifs"], nsfw: false});

module.exports = {
    node,
    path: "!"
};