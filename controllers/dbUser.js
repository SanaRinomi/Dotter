const LevelObj = {
    level,
    exp
};

const PermsObj = {
    // Insert commands here
};

const CommandData = {
    id, // Auto-increment
    path, // d!fun
    command, // dice
    description,
    args, // {type, name, optional}
    perms, // Discord Perms,
    timestamp
};

const CommUsageData =  {
    commId,
    usage, // Usage every 30 minutes
    timestamp
};

const UserData = {
    id,
    glevel: new LevelObj(),
    guilds: [{
        id,
        level: new LevelObj()
    }]
};