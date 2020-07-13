const DBObject = require("./DBObject");
const GuildCache = new Map();
const {guild} = require("../controllers/dbMain");

class Guild extends DBObject {
    get users() {return this._users;}
    get roles() {return this._roles;}
    get channels() {return this._channels;}
    get filters() {return this._filters;}

    constructor(id, roles = {mute:null,user_assignable:new Map(),custom:[]}, channels = new Map(), filters = { // Default filter values
        enabled: false,
        common: false,
        words: [],
        black_list_mode: true,
        channel_list: [],
        emoji_limit: 0
    }, welcome = {
        enabled: false,
        message: null,
        channels: [],
        image: false
    }) {
        super();
        this._id = id;
        this._users = new Map();
        this._roles = {mute:null,user_assignable:[],custom:[]};
        this._channels = new Map();  // For now, we got: Logs, Announcements
        
        this._filters = { // Default filter values
            enabled: false,
            common: false,
            words: [],
            black_list_mode: true,
            emoji_limit: 0,
            channel_list: [],
            ...filters
        };

        this._welcome = { // Default welcome values
            enabled: false,
            message: null,
            channel: null,
            image: false,
            ...welcome
        };
    }

    save() {
        
    }

    static cache() {
        return GuildCache;
    }
}

module.exports = Guild;