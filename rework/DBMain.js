const pg = require("./dbKnex");
const {Table, LinkingTable} = require("./DBTable");

class UserTable extends Table {
    constructor() {
        super("dot_users", table => {
            table.string("id").primary();
            table.string("username").notNullable();
            table.string("nickname");
            table.string("description");
            table.integer("reputation").defaultTo(0);
            table.integer("currency").defaultTo(0);
            table.integer("experience").defaultTo(0);
            table.integer("level").defaultTo(0);
            table.json("extra");
        });

        this._cache = true;
    }
}

class GuildTable extends Table {
    constructor() {
        super("dot_guilds", table => {
            table.string("id").primary();
            table.string("name").notNullable();
            table.string("icon_url");
            table.json("welcome");
            table.json("logs");
            table.json("filter");
            table.json("extra");
        });

        this._cache = true;
    }
}

class GuildUserTable extends LinkingTable {
    constructor() {
        super("dot_guild_users", "user_id", "dot_users.id", "guild_id", "dot_guilds.id", table => {
            table.string("id").primary();
            table.string("user_id").references("dot_users.id").notNullable();
            table.string("guild_id").references("dot_guilds.id").notNullable();
            table.integer("experience").defaultTo(0);
            table.integer("level").defaultTo(0);
            table.integer("permissions").defaultTo(0);
            table.json("extra");
        }, false);
    }
}

class LogsTable extends Table {
    constructor() {
        super("dot_logs", table => {
            table.increments("id");
            table.string("guild_id").references("dot_guilds.id").notNullable();
            table.integer("event_type").notNullable();
            table.string("enforcer").references("dot_guild_users.id").nullable();
            table.string("target").references("dot_guild_users.id").nullable();
            table.string("reason");
            table.timestamp("created_at").defaultTo(pg.fn.now());
            table.json("extra");
        });
    }
}

class RolesTable extends Table {
    constructor() {
        super("dot_roles", table => {
            table.string("id").primary();
            table.string("guild_id").references("dot_guilds.id").notNullable();
            table.integer("role_type").notNullable();
            table.string("name");
            table.integer("permissions").defaultTo(0);
            table.integer("priority_level").defaultTo(0);
            table.string("description");
            table.json("extra");
        });
    }
}

class TimersTable extends Table {
    constructor() {
        super("dot_timers", table => {
            table.increments("id");
            table.integer("event_type").notNullable();
            table.string("channel_id").notNullable();
            table.string("guild_id").references("dot_guilds.id").nullable();
            table.string("user_id").references("dot_users.id").nullable();
            table.timestamp("created_at").defaultTo(pg.fn.now());
            table.timestamp("until").defaultTo(pg.fn.now());
            table.json("extra");
        });
    }
}

class CosmeticsTable extends Table {
    constructor() {
        super("dot_cosmetics", table => {
            table.increments("id");
            table.string("name").notNullable();
            table.string("location").notNullable();
            table.string("description");
            table.integer("type").notNullable();
            table.integer("cost").defaultTo(0);
            table.boolean("default").defaultTo(false);
        });
    }
}

class UserCosmeticsTable extends LinkingTable {
    constructor() {
        super("dot_user_cosmetic", "user_id", "dot_users.id", "cosmetic_id", "dot_cosmetics.id", table => {
            table.string("user_id").references("dot_users.id").notNullable();
            table.integer("cosmetic_id").references("dot_cosmetics.id").notNullable();
            table.boolean("in_use").defaultTo(false);
        }, false);
    }
}

class UserRolesTable extends LinkingTable {
    constructor() {
        super("dot_user_role", "user_id", "dot_users.id", "role_id", "dot_roles.id", table => {
            table.string("user_id").references("dot_users.id").notNullable();
            table.string("role_id").references("dot_roles.id").notNullable();
        }, false);
    }
}

const Users = new UserTable();
const Guilds = new GuildTable();
const GuildUsers = new GuildUserTable();
const Roles = new RolesTable();
const UserRoles = new UserRolesTable();
const Cosmetics = new CosmeticsTable();
const UserCosmetics = new UserCosmeticsTable();
const Logs = new LogsTable();
const Timers = new TimersTable();

module.exports = {
    Users,
    Guilds,
    GuildUsers,
    Roles,
    UserRoles,
    Cosmetics,
    UserCosmetics,
    Logs,
    Timers
};