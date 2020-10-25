const DBObject = require("./DBObject");
const GuildCache = new Map();
const GuildConfigCache = new Map();
const GuildRoleCache = new Map();
const {GuildData} = require("../controllers/dbMain");
const RolePerms = require("./Permissions");
const {Role, Structures} = require("discord.js");

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

class GuildRole {
    get ID() {return this._id;}
    get Name() {return this._name;}
    get Permissions() {return this._permissions;}
    get Needs() {return this._needs;}

    constructor(roleid, type, data = {name: null, permissions: 0, needs: []}) {
        this._id = roleid;
        this._name = data && data.name ? data.name : null;
        this._permissions = new RolePerms(data && data.permissions ? data.permissions : 0);
        this._needs = data && data.needs ? needs : [];
        this._type = type;
    }

    toJSON() {
        return {
            name: this._name,
            permissions: this._permissions,
            needs: this._needs
        };
    }
}

/** Dotter RoleManager for multi-role data management */
class RoleManager {
    /**
     * Create a Dotter RoleManager
     * @param {*[]} [arr=[]] Array data containing role data
     * @param {*[]} arr[].id Role ID
     * @param {*[]} arr[].value Role data
     * @param {number} type Role type
     */
    constructor(arr = [], type) {
        this._cache = new Map(arr);
        this._type = type;
    }

    add(role) {
        if(role instanceof GuildRole)
            this._cache.set(role.ID, role);
        else if(role instanceof Role)
            this._cache.set(role.id, new GuildRole(role.id, this._type, {name: role.name}));
        else if(Array.isArray(role)) role.forEach(v => this.add(v));
        else if(typeof role === "object")
            this._cache.set(role.id, new GuildRole(role.id, this._type, role.value));
        else throw new TypeError("The type of 'role' is not valid");
    }

    remove(role) {
        if(role instanceof GuildRole)
            this._cache.delete(role.ID);
            
        else if(Array.isArray(role)) role.forEach(v => this.remove(v));
        else if(role instanceof Role || typeof role === "object")
            this._cache.delete(role.id);
        else throw new TypeError("The type of 'role' is not valid");
    }

    /**
     * Callback used to determine which value gets added to the filtered array
     * @callback RoleManager~booleanCallback
     * @param {GuildRole} value A GuildRole in the current RoleManager
     * @param {number} index Index of the GuildRole in the current RoleManager
     * @returns {boolean} Return true to keep value in filtered array
     */

    /**
    * Filter function 
    * @param {RoleManager~booleanCallback} cb - Fuction that iterates over the roles in RoleManager
    * @returns {GuildRole[]} Filtered array
    */
    filter(cb = (GuildRole) => {return true;}) {

    }
}



let test = new RoleManager();
test.filter();

class GuildRoles extends Map {
    get ID() {return this._id;}
    get Guild() {return this._guild;}
    get Cache() {return GuildRoleCache;}

    constructor(guild, roles = []) {
        super(roles.map(v => {return [v.id, v.value[0] && v.value[0].id ? new Map(v.value.map(vv => [vv.id,new GuildRole(vv.id, v.id, vv.value)])) : v.value];}));

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
                value.forEach((vv, ii) => {arrv.push({id: ii, value: vv.toJSON()});});
                arr.push({id, value: arrv});
            } else arr.push({id, value});
        });
        return arr;
    }

    static toMap(array = []) {
        return new Map(array.map(v => {return [v.id, v.value[0] && v.value[0].id ? new Map(v.value.map(vv => [vv.id,new GuildRole(vv.id, v.id, vv.value)])) : v.value];}));
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
}

class GuildConfig extends DBObject {
    get Welcome() { return this._welcome; }
    get Filter() { return this._filter; }
    get Logs() { return this._logs; }
    get Cache() { return GuildConfigCache; }

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
        return await GuildData.upsert(this._id, {configs: this.toJSON()});
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
}



class Guild extends DBObject {
    get ID() {return this._id;}
    get Roles() {return this._roles;}
    get Configuration() {return this._configs;}
    get Config() {return this._configs;}
    get Cache() {return GuildCache;}

    get Name() {return this._extra.name ? this._extra.name : "";}
    set Name(val) {this._extra.name = val;}
    get Icon() {return this._extra.icon ? this._extra.icon : "";}
    set Icon(val) {this._extra.icon = val;}

    constructor(id, roles = [], config = defaultConfig, extra = {}) {
        super();
        this._id = id;
        this._users = new Map();
        this._roles = new GuildRoles(this, roles ? roles : []);
        this._configs = new GuildConfig(this, config);
        this._extra = extra && !Array.isArray(extra) ? extra : {};

        GuildCache.set(this._id, this);
    }

    save() {
        let json = this.toJSON();
        GuildData.upsert(this._id, {roles:json.roles, configs:json.configs, extra:json.extra});
    }

    addGuildUser(guilduser) {
        this._users.set(guilduser.User.ID, guilduser);
    }

    toJSON() {
        return {
            id: this._id,
            users: [...this._users.keys()],
            roles: this._roles.toJSON(),
            configs: this._configs.toJSON(),
            extra: this._extra
        };
    }
    
    static get(id) {
        return GuildCache.get(id);
    }

    static async fetch(id) {
        const cache = GuildCache.get(id);
        if(cache) return cache;

        const res = await GuildData.get(id);
        if(res.success) {
            return new Guild(id, res.data.roles, res.data.configs, res.data.extra);
        } else return new Guild(id);
    }
}


// Structures.extend("Guild", Guild => {
//     class GuildDB extends Guild {
//         constructor(...args) {
//             super(...args);
//             this._configs = new GuildConfig(this, config);
//         }

//     }

//     return GuildDB;
// });


module.exports = {GuildRole, GuildConfig, GuildRoles, Guild};