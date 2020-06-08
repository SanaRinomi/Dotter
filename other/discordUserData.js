let userData = null;

class UserData {
    constructor(client) {
        this.client = client;
        
        this.guilds = [];
        this.users = [];
        this.online = [];
        this.idle = [];
        this.invis = [];
        this.dnd = [];
        this.bots = [];
        this.totals = {};
        this.last;
    }

    async updateData() {
        if (process.uptime() - this.last > 60 || this.last === undefined) {
            this.guilds = [];
            this.users = [];
            this.online = [];
            this.idle = [];
            this.invis = [];
            this.dnd = [];
            this.bots = [];
            this.totalUserCount = 0;
            this.last = process.uptime();
            
            await Promise.all(this.client.guilds.cache.map(async (guild) => {
                return await this.updateGuildData(guild);
            }));
            
            this.totals.online = this.online ? this.online.reduce((t, c) => {return t+c;}) : 0;
            this.totals.idle = this.idle ? this.idle.reduce((t, c) => {return t+c;}) : 0;
            this.totals.invis = this.invis ? this.invis.reduce((t, c) => {return t+c;}) : 0;
            this.totals.dnd = this.dnd ? this.dnd.reduce((t, c) => {return t+c;}) : 0;
            this.totals.users = this.users ? this.users.reduce((t, c) => {return t+c;}) : 0;

            return;
        }
    }

    async updateGuildData(guild) {
        let members = await guild.members.fetch();
        let users = members.filter(member => !member.user.bot),
            bots = members.filter(member => member.user.bot).size;
        

        let online = users.filter(member => member.presence.status === "online").size,
            idle = users.filter(member => member.presence.status === "idle").size,
            dnd = users.filter(member => member.presence.status === "dnd").size,
            total = users.size;

        let invis = total - (online + idle + dnd);

        this.guilds.push(guild.id);
        this.users.push(total);
        this.online.push(online);
        this.idle.push(idle);
        this.invis.push(invis);
        this.dnd.push(dnd);
        this.bots.push(bots);
        return;
    }

    async getTotals() {
        await this.updateData();

        return {
            guilds: this.guilds.length,
            ...this.totals
        };
    }

    async getGuildUsers(id) {
        await this.updateData();

        for (let i = 0; i < this.guilds.length; i++) {
            const guild = this.guilds[i];
            if(guild !== id) continue;

            return {
                online: this.online[i],
                idle: this.idle[i],
                dnd: this.dnd[i],
                invis: this.invis[i],
                users: this.users[i],
                bots: this.bots[i]
            };
        }

        return {
            online: 0,
            idle: 0,
            dnd: 0,
            invis: 0,
            users: 0,
            bots: 0
        };
    }
}

module.exports = async (cli) => {
    if(!userData){
        userData = new UserData(cli.discordCli);
        await userData.updateData();
    }

    return userData;
};