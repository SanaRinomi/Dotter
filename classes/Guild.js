const DBObject = require("./DBObject");
const GuildCache = new Map();
const GuildConfigCache = new Map();
const GuildRoleCache = new Map();
const {GuildData} = require("../controllers/dbMain");

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

class GuildRoles extends Map {
    get ID() {return this._id;}
    get Guild() {return this._guild;}

    constructor(guild, roles = []) {
        super(roles.map(v => {return [v.id, v.value[0] && v.value[0].id ? new Map(v.value.map(vv => [vv.id,vv.value])) : v.value];}));

        this._id = guild.ID;
        this._guild = guild;
    }

    toJSON() {
        return GuildRoles.toArray(this._roles);
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

    static async fetch(id) {
        let guild = await Guild.fetch(id);
        return guild ? guild.Roles : null;
    }

    static get(id) {
        return GuildRoleCache.get(id);
    }

    static cache() {
        return GuildRoleCache;
    }
}

class GuildConfig extends DBObject {
    get Welcome() { return this._welcome; }
    get Filter() { return this._filter; }
    get Logs() { return this._logs; }

    set Welcome(val) { 
        this._welcome = {
            ...this._welcome,
            ...val
        };
    }

    set Filter(val) { 
        this._filter = {
            ...this._filter,
            ...val
        };
    }

    set Logs(val) { 
        this._logs = {
            ...this._logs,
            ...val
        };
    }

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

    async save() {
        return await GuildData.upsert(id, {configs: this.toJSON()});
    }
    async load() {}
    toJSON() {
        return {
            welcome: this._welcome,
            logs: this._logs,
            filter: this._filter
        };
    }
    static async fetch(id) {
        let guild = await Guild.fetch(id);
        return guild ? guild.Configuration : null;
    }

    static get(id) {
        return GuildConfigCache.get(id);
    }

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
        this._roles = new GuildRoles(this, roles ? roles : []);
        this._configs = new GuildConfig(config);

        GuildCache.set(this._id, this);
    }

    save() {
        let json = this.toJSON();
        GuildData.upsert(this._id, {roles:json.roles, configs:json.configs});
    }


    toJSON() {
        return {
            id: this._id,
            users: [...this._users.keys()],
            roles: this._roles.toJSON(),
            configs: this._configs.toJSON()
        };
    }

    static cache() {
        return GuildCache;
    }
    
    static get(id) {
        return GuildCache.get(id);
    }
    static async fetch(id) {
        const cache = GuildCache.get(id);
        if(cache) return cache;

        const res = await GuildData.get(id);
        if(res.success) {
            return new Guild(id, res.data.roles, res.data.configs);
        } else return new Guild(id);
    }
}

module.exports = {GuildConfig, GuildRoles, Guild};