const {Nodes: {DataNode}} = require("framecord");

const node = new DataNode("nsfw", {name: "Please NSFW", desc: "NSFW Please commands", tags: ["entertainment", "gifs", "nsfw"], nsfw: true});

module.exports = {
    node,
    path: "!pls"
};