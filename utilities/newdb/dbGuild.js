const pg = require("../dbKnexConf");
const DBTable = require("./dbTable");

class GuildTable extends DBTable {
    constructor(tablename = "guilds") {
        super(tablename, table => {
            table.bigInteger("id").unsigned().primary();
            table.json("roles");
            table.json("configs");
            table.json("extra").nullable();
        });
    }

    async upsert(id, roles, configs, extra = null) {
        return super.upsert(id, {roles,configs,extra});
    }

    upsertRoles(id, roles) {
        return super.upsert(id, {roles});
    }
}

const GuildData = new GuildTable();

let guildConvert = async function(id, welcome, logs, filters, roles, table = "guilds") {
    let config = {
        welcome: {
            enabled: false,
            message: null,
            channel: null,
            image: false,
            ...welcome
        },
        logs: {
            enabled: false,
            default: null,
            ...logs
        },
        filter: {
            enabled: false,
            common: false,
            words: [],
            deny_list_mode: true,
            emoji_limit: 0,
            channel_list: [],
            ...filters
        }
    };

    const nroles = roles.map(v => {return {id: v.type, value: v.roles[0] && v.roles[0].id ? v.roles.map(vv => {return {id: vv.id, value: {name:vv.name}};}) : v.roles[0]};});

    return await GuildData.upsert(id, nroles, config);
};

module.exports = {
    guildConvert,
    GuildData,
    classes: {
        GuildTable
    }
};