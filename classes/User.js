const DBObject = require("./DBObject");
const {SimpleLevels} = require("./Level");
const {logs} = require("../controllers/dbMain");
const {LevelGuildTemp, LevelGlobalTemp, ProfileTemp} = require("../controllers/canv");
const UserCache = new Map();

class GuildUser extends DBObject {
    constructor(user, guild, data = {permissions:0,roles:[],level:{exp: 0, level: 0}}) {
        this._user = user;
        this._guild = guild;

        this._permissions = data ? data.permissions : 0;
        this._roles = data ? data.roles : [];
        this._logs = [];
        this._level = SimpleLevels.fromJSON({exp: 0, level: 0, ...data.level});
        logs.getOffenses(user.id, guild.id).then(v => {
            if(v.success) {
                this._events = v.data;
            }
        });
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
}

class User extends DBObject {
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
        rep: currDate,
        daily: currDate,
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
    }

    async generateProfile(userTag, userAvatar) {
        let level = {
            percentage: Math.round(this._level._reqs.percentage),
            currExp: this._level.experience > 1000 ? Math.round(this._level.experience/1000)+"K" : Math.round(this._level.experience),
            req: this._level._reqs.next > 1000 ? Math.round(this._level._reqs.next/1000)+"K" : Math.round(this._level._reqs.next),
            level: this._level._currLvl
        };

        return await ProfileTemp.generate({bkgnd: this._cosmetics.currBackground, uname: userTag, aurl: userAvatar, leveling: this._level.toJSON(true), profile: this._profile, level});
        //TODO: Adjust Profile Template
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

    static cache() {
        return UserCache;
    }
}

