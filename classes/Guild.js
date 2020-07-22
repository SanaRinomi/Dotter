const DBObject = require("./DBObject");
const GuildCache = new Map();
const GuildConfigCache = new Map();
const {guild} = require("../controllers/dbMain");

const defaultConfig = {
    welcome: {
        enabled: false,
        message: null,
        channel: null,
        image: false
    },
    logs: {
        enabled: false,
        default: null
    },
    filter: {
        enabled: false,
        common: false,
        words: [],
        deny_list_mode: true,
        emoji_limit: 0,
        channel_list: []
    }
};

class GuildRoles extends DBObject {
    constructor(guild, roles = []) {
        super();

        this._id = guild.ID;
        this._guild = guild;
        this._roles = GuildRoles.toMap(roles);
    }

    toJSON() {
        return {guild: this._id, roles: GuildRoles.toArray(this._roles)};
    }

    static toArray(map = new Map()) {
        let arr = [];
        map.forEach((value, id) => {
            if(value instanceof Map){
                let arrv = [];
                value.forEach((vv, ii) => {arrv.push({id: ii, value: vv});});
                arr.push({id, value: arrv});
            } else arr.push({id, value});
        });
        return arr;
    }

    static toMap(array = []) {
        return new Map(array.map(v => {return [v.id, v.value[0] && v.value[0].id ? new Map(v.value.map(vv => [vv.id,vv.value])) : v.value];}));
    }

    static fromJSON(json) {
        return new GuildRoles(json);
    }
}

class GuildConfig extends DBObject {
    constructor(guild, config = defaultConfig) {
        super();

        this._id = guild.ID;
        this._guild = guild;
        this._welcome = {
            ...defaultConfig.welcome,
            ...config.welcome
        };

        this._logs = {
            ...defaultConfig.logs,
            ...config.logs
        };

        this._filter = {
            ...defaultConfig.filter,
            ...config.filter
        };

        GuildConfigCache.set(this._id, this);
    }

    async save() {}
    async load() {}
    toJSON() {}
    static async fetch(id) {
        let guild = await Guild.fetch(id);
        return guild ? guild.Configuration : null;
    }

    static get(id) {
        return GuildConfigCache.get(id);
    }
    static fromJSON(json) {}

    static cache() {
        return GuildConfigCache;
    }
}

class Guild extends DBObject {
    get ID() {return this._id;}
    get Roles() {return this._roles;}
    get Configuration() {return this._config;}
    get Config() {return this._config;}

    constructor(id, roles = [], config = defaultConfig) {
        super();
        this._id = id;
        this._users = new Map();
        this._roles = roles[0] && Array.isArray(roles[0]) ? new Map(roles) : new Map();
        this._config = new GuildConfig(config);

        GuildCache.set(this._id, this);
    }

    save() {
        
    }

    static cache() {
        return GuildCache;
    }
}

module.exports = {GuildConfig, GuildRoles, Guild};