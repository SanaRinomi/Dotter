const DBObject = require("./DBObject");
const {SimpleLevels} = require("./Level");
const {GuildUserData, UserData} = require("../controllers/dbMain");
const GuildUserPerms = require("./Permissions");
const {Guild} = require("./Guild");
const {LevelGuildTemp, LevelGlobalTemp, ProfileTemp, LevelUpTemp} = require("../controllers/canv");
const UserCache = new Map(), GuildUserCache = new Map();
const moment = require("moment");

class GuildUser extends DBObject {
    get User() { return this._user; }
    get Guild() { return this._guild; }
    get Cache() { return GuildUserCache; }

    constructor(user, guild, data = {permissions:0,roles:[],level:{exp: 0, level: 0}, logs:[]}) {
        super();

        this._user = user;
        this._guild = guild;

        this._permissions = new GuildUserPerms(data ? data.permissions : 0);
        this._roles = data ? data.roles : [];
        this._logs = data ? data.logs : [];
        this._level = SimpleLevels.fromJSON(data ? {exp: 0, level: 0, ...data.level} : {exp: 0, level: 0});

        this._expCounter = 0;

        GuildUserCache.set(`${user.ID}:${guild.ID}`, this);
        this._user.addGuildUser(this);
        this._guild.addGuildUser(this);
    }

    expCall(cb) {
        ++this._expCounter;
        if(this._expCounter > 5) {
            this._expCounter = 0;
            this._level.addExperience(1).then(v => {if(v) {cb({type:"guild",level:v});this.save();}});
        }
        
        this._user.expCall(cb);
    }

    async generateLevel(guildName, guildAvatar) {
        let guild = {
            percentage: Math.round(this._level._reqs.percentage),
            percentageFull: this._level._reqs.percentage,
            currExp: this._level.experience > 1000 ? Math.round(this._level.experience/1000)+"K" : Math.round(this._level.experience),
            req: this._level._reqs.next > 1000 ? Math.round(this._level._reqs.next/1000)+"K" : Math.round(this._level._reqs.next),
            level: this._level._currLvl
        };

        let global = {
            percentage: Math.round(this._user._level._reqs.percentage),
            percentageFull: this._user._level._reqs.percentage,
            currExp: this._user._level.experience > 1000 ? Math.round(this._user._level.experience/1000)+"K" : Math.round(this._user._level.experience),
            req: this._user._level._reqs.next > 1000 ? Math.round(this._user._level._reqs.next/1000)+"K" : Math.round(this._user._level._reqs.next),
            level: this._user._level._currLvl
        };

        return await LevelGuildTemp.generate({bkgnd: this._user._cosmetics.currBackground, guild, global, gname: guildName, gurl: guildAvatar});
    }

    async generateLevelUp(lvl, uname, aurl) {
        return await LevelUpTemp.generate({bkgnd: this._user._cosmetics.currBackground, level: lvl, uname, aurl});
    }

    log(type, reason = null, enforcer = null, extra = null) {
        let data = {
            type,
            reason,
            enforcer,
            extra,
            created_at: moment().toISOString()
        };

        this._logs.push(data);
        this.save();
    }

    async save() {
        GuildUserData.upsert({user: this._user.ID, guild: this._guild.ID}, {permissions: this._permissions.bitfield, roles: this._roles, logs: this._logs, level: this._level});
    }

    static get(user, guild) {
        return GuildUserCache.get(`${userid}:${guildid}`);
    }

    static async fetch(userid, guildid) {
        const cache = GuildUserCache.get(`${userid}:${guildid}`);
        if(cache) return cache;

        const user = await User.fetch(userid);
        const guild = await Guild.fetch(guildid);
        const res = await GuildUserData.get(userid, guildid);

        return new GuildUser(user, guild, res.success ? {permissions: res.data.permissions, roles: res.data.roles, logs: res.data.logs, level: res.data.level} : undefined);
    }
}

class User extends DBObject {
    get ID() {return this._id;}
    get Cache() { return UserCache; }

    constructor(id, profile = {
        username: "",
        nickname: "",
        description: "",
        reputation: 0,
        currency: 0
    }, cosmetics = {
        backgrounds: ["Base"],
        currBackground: "Base"
    }, limits = {
        daily_count: 0
    },level = {exp: 0, level: 0}) {
        super();

        this._id = id;
        this._profile = {
            username: "",
            nickname: "",
            description: "",
            reputation: 0,
            currency: 0,
            ...profile
        };

        this._cosmetics = {
            backgrounds: ["Base"],
            currBackground: "Base",
            ...cosmetics
        };

        let currDate = moment().toDate();
        this._limits = {
            rep: currDate,
            daily: currDate,
            daily_count: 0,
            ...limits
        };

        this._level = SimpleLevels.fromJSON({exp: 0, level: 0, ...level});
        this._guildUsers = new Map();

        this._expCounter = 0;
        UserCache.set(this._id, this);
    }

    expCall(cb) {
        ++this._expCounter;
        if(this._expCounter > 10) {
            this._expCounter = 0;
            this._level.addExperience(1).then(v => {if(v){ cb({type:"global",level:v});this.save();}});
        }
    }

    async generateProfile(userTag, userAvatar) {
        let level = {
            percentage: Math.round(this._level._reqs.percentage),
            currExp: this._level.experience > 1000 ? Math.round(this._level.experience/1000)+"K" : Math.round(this._level.experience),
            req: this._level._reqs.next > 1000 ? Math.round(this._level._reqs.next/1000)+"K" : Math.round(this._level._reqs.next),
            level: this._level._currLvl
        };

        return await ProfileTemp.generate({bkgnd: this._cosmetics.currBackground, uname: userTag, aurl: userAvatar, levelling: this._level.toJSON(true), profile: this._profile, level});
    }

    async generateLevel() {
        let global = {
            percentage: Math.round(this._level._reqs.percentage),
            percentageFull: this._level._reqs.percentage,
            currExp: this._level.experience > 1000 ? Math.round(this._level.experience/1000)+"K" : Math.round(this._level.experience),
            req: this._level._reqs.next > 1000 ? Math.round(this._level._reqs.next/1000)+"K" : Math.round(this._level._reqs.next),
            level: this._level._currLvl
        };

        return await LevelGlobalTemp.generate({bkgnd: this._cosmetics.currBackground, global});
    }

    save() {
        UserData.upsert(this._id, {profile: this._profile, cosmetics: this._cosmetics, limits: this._limits, level: this._level});
    }

    addGuildUser(guilduser) {
        this._guildUsers.set(guilduser.Guild.ID, guilduser);
    }

    static get(id) {
        return UserCache.get(id);
    }

    static async fetch(id) {
        const cache = UserCache.get(id);
        if(cache) return cache;

        const res = await UserData.get(id);
        if(res.success) {
            return new User(id, res.data.profile, res.data.cosmetics, res.data.limits, res.data.level);
        } else return new User(id);
    }
}

module.exports = {
    GuildUser,
    User
};