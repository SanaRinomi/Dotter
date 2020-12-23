const {DataBase} = require("knex-dbtables"),
        {db} = require("../config.json");

const notNull = true;

const DotterDB = new DataBase(db, "dotter_");

// Basic Settings Tables

const SettingsTable = DotterDB.addTable({
    name: "settings",
    columns: {
        id: "increment",
        name: {type: "string", notNull},
        description: "string",
        constraint: {type: "boolean", notNull},
        data_type: {type: "integer", notNull},
        default_value: "string",
        min_value: "string",
        max_value: "string"
    }
});

const AllowedValuesTable = DotterDB.addTable({
    name: "allowed_setting_values",
    columns: {
        id: "increment",
        setting_id: {type: "integer", references: "settings.id", notNull},
        name: {type: "string", notNull},
        description: "string",
        value: {type: "string", notNull}
    }
});

// Bot Settings

const BotSettingsTable = DotterDB.addTable({
    name: "bot_settings",
    columns: {
        id: "increment",
        setting_id: {type: "integer", references: "settings.id", notNull},
        constrained_value: {type: "integer", references: "settings.id"},
        unconstrained_value: "string"
    }
});

// User Tables

const UsersTable = DotterDB.addTable({
    name: "users",
    columns: {
        id: {type: "string", primary: true},
        username: {type: "string", notNull},
        nickname: {type: "string"},
        description: {type: "string"},
        reputation: {type: "integer", defaultTo: 0},
        currency: {type: "integer", defaultTo: 0},
        experience: {type: "integer", defaultTo: 0},
        level: {type: "integer", defaultTo: 0},
        extra: "json"
    }
});

const CosmeticsTable = DotterDB.addTable({
    name: "cosmetics",
    columns: {
        id: "increment",
        name: {type: "string", notNull},
        type: {type: "integer", notNull},
        location: {type: "string"},
        local: {type: "boolean", defaultTo: true},
        description: {type: "string"},
        cost: {type: "integer", defaultTo: 0}
    }
});

const L_UserCosmeticsTable = DotterDB.addTable({
    name: "link_user_cosmetics",
    columns: {
        user: {type: "string", references: "users.id", notNull},
        cosmetic: {type: "integer", references: "cosmetics.id", notNull},
    }
});

const UserSettingsTable = DotterDB.addTable({
    name: "user_settings",
    columns: {
        id: "increment",
        user_id: {type: "string", references: "users.id", notNull},
        setting_id: {type: "integer", references: "settings.id", notNull},
        constrained_value: {type: "integer", references: "settings.id"},
        unconstrained_value: "string"
    }
});

// Guild Tables

const GuildsTable = DotterDB.addTable({
    name: "guilds",
    columns: {
        id: {type: "string", primary: true},
        name: {type: "string", notNull},
        icon_url: {type: "string", notNull},
        extra: "json"
    }
});

const GuildChannelsTable = DotterDB.addTable({
    name: "guild_channels",
    columns: {
        id: {type: "string", primary: true},
        guild_id: {type: "string", references: "guilds.id", notNull},
        name: {type: "string", notNull},
        description: "string"
    }
});

const GuildRolesTable = DotterDB.addTable({
    name: "guild_roles",
    columns: {
        id: {type: "string", primary: true},
        guild_id: {type: "string", references: "guilds.id", notNull},
        name: {type: "string", notNull},
        description: "string"
    }
});

const GuildSettingsTable = DotterDB.addTable({
    name: "guild_settings",
    columns: {
        id: "increment",
        guild_id: {type: "string", references: "guilds.id", notNull},
        setting_id: {type: "integer", references: "settings.id", notNull},
        constrained_value: {type: "integer", references: "settings.id"},
        unconstrained_value: "string"
    }
});

const GuildRoleSettingsTable = DotterDB.addTable({
    name: "guild_role_settings",
    columns: {
        id: "increment",
        role_id: {type: "string", references: "guild_roles.id", notNull},
        setting_id: {type: "integer", references: "settings.id", notNull},
        constrained_value: {type: "integer", references: "settings.id"},
        unconstrained_value: "string"
    }
});

const GuildChannelSettingsTable = DotterDB.addTable({
    name: "guild_channel_settings",
    columns: {
        id: "increment",
        channel_id: {type: "string", references: "guild_channels.id", notNull},
        setting_id: {type: "integer", references: "settings.id", notNull},
        constrained_value: {type: "integer", references: "settings.id"},
        unconstrained_value: "string"
    }
});

// Guild User Tables

const GuildUsersTable = DotterDB.addTable({
    name: "guild_users",
    columns: {
        user_id: {type: "string", references: "users.id", notNull},
        guild_id: {type: "string", references: "guilds.id", notNull},
        reputation: {type: "integer", defaultTo: 0},
        currency: {type: "integer", defaultTo: 0},
        experience: {type: "integer", defaultTo: 0},
        level: {type: "integer", defaultTo: 0},
        extra: "json"
    }
});

const L_UserRolesTable = DotterDB.addTable({
    name: "link_user_roles",
    columns: {
        user: {type: "string", references: "users.id", notNull},
        role: {type: "string", references: "guild_roles.id", notNull},
    }
});

// Guild Related Tables

const LogsTable = DotterDB.addTable({
    name: "logs",
    columns: {
        id: {type: "string", primary: true},
        guild_id: {type: "string", references: "guilds.id", notNull},
        event_type: {type: "integer", notNull},
        enforcer: {type: "string", references: "users.id"},
        target: {type: "string", references: "users.id"},
        reason: "string",
        created_at: {type: "timestamp", defaultTo: "now"},
        extra: "json"
    }
});

const TimersTable = DotterDB.addTable({
    name: "timers",
    columns: {
        id: {type: "string", primary: true},
        timer_type: {type: "integer", notNull},
        guild_id: {type: "string", references: "guilds.id", notNull},
        user_id: {type: "string", references: "users.id"},
        channel_id: {type: "string", references: "guild_channels.id"},
        created_at: {type: "timestamp", defaultTo: "now"},
        until: {type: "timestamp", defaultTo: "now"},
        extra: "json"
    }
});

module.exports = {
    Database: DotterDB,
    settings: {
        SettingsTable,
        AllowedValuesTable,
        BotSettingsTable,
        UserSettingsTable,
        GuildSettingsTable,
        GuildRoleSettingsTable,
        GuildChannelSettingsTable
    },
    user: {
        UsersTable,
        CosmeticsTable,
        L_UserCosmeticsTable
    },
    guild: {
        GuildsTable,
        GuildRolesTable,
        GuildChannelsTable,
        GuildUsersTable,
        LogsTable,
        TimersTable,
        L_UserRolesTable
    }
};