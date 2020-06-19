const {Level, SimpleLevels} = require("./Level");
const {Users} = require("../controllers/cache");
const {users, levels} = require("../controllers/dbMain");
const moment = require("moment");
// const {ProfileTemp} = require("../controllers/canv");

class Profile {
    constructor(id, data = {nickname: "", description: "", reputation: 0, currency: 0, limits: {rep: moment().toDate(), daily: moment().toDate(), daily_count: 0}, background: "Base"},
    lvls = {exp: 0, level: 0, expMulti: 1.8}) {
        this.expCalls = 0;

        this.id = id;
        this.nickname = data.nickname;
        this.description = data.description;
        this.reputation = data.reputation;
        this.currency = data.currency;
        this.daily = data.daily;
        this.limits = data.limits ? data.limits : {rep: moment().toDate(), daily: moment().toDate(), daily_count: 0};
        this.global_level = SimpleLevels.fromJSON(lvls);
        this.guild_levels = [];
        this.background = data.background ? data.background : "Base";
        // if(!ProfileTemp._backgrounds(this.background)) this.background = "Base";
        
        levels.getGuildsLevels(id).then(v => {
            if(v.success) {
                this.guild_levels = v.data.map(v => {return {id: v.guild, level: SimpleLevels.fromJSON(v.leveling)};});
            }
        });
    }

    messageExp(msg, cb) {
        ++this.expCalls;
        if(this.expCalls === 5 || this.expCalls === 10) {
            let guild = this.guild_levels.find(v => v.id === msg.guild.id);
            if(guild) {
                guild.level.addExperience(1).then(v => {if(v) cb(v);});
            }
            else {
                let level = new SimpleLevels(1, 0);
                this.guild_levels.push({id: msg.guild.id, level});
            }

            if(this.expCalls === 10)
                this.global_level.addExperience(1).then(v => {
                    if(v) {
                        this.currency += 30 * v;
                        this.profileUpdate();
                    }
                });

            this.updateLevel();
        }
    }

    updateLevel() {
        if(this.expCalls >= 10) {
            this.expCalls = 0;
            users.updateLevel(this.id, this.global_level.toJSON()).then();
            levels.getGuildsStored(this.id, this.guild_levels.map(v => v.id)).then(v => {
                this.guild_levels.forEach(vv => {
                    if(v.includes(vv.id)) 
                        levels.updateLevel(this.id, vv.id, vv.level.toJSON());
                    else levels.addLevel(this.id, vv.id, vv.level.toJSON());
                });
            });
        }
    }

    profileUpdate(){
        let json = this.toJSON();
        users.updateProfile(this.id, json.profile);
    }

    toJSON(bool = false) {
        return {
            profile: {
                nickname: this.nickname,
                description: this.description,
                reputation: this.reputation,
                currency: this.currency,
                limits: this.limits,
                background: this.background
            },
            leveling: {
                global: this.global_level.toJSON(bool),
                guilds: this.guild_levels.map(v => {return {id: v.id, level: v.level.toJSON(bool)};})
            }
        };
    }

    static get(id) {
        return Users.get(id);
    }

    static async fetch(id) {
        let user = Users.get(id);
        if(!user) {
            let bool = await users.isUserStored(id);
            if(bool) {
                let json = (await users.getUser(id)).data;
                user = new Profile(id, json.profile, json.leveling);
            } else {
                user = new Profile(id);
                let json = user.toJSON();
                users.addUser(id, user.toJSON().profile, user.global_level.toJSON());
            }

            Users.set(id, user);
        }
        
        return user;
    }
}

module.exports = Profile;