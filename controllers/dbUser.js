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
        level: new LevelObj(),
        perms: new PermsObj()
    }]
};

class MiddlewareHandler {
    constructor(cli, comm, msg, exec, node, permCheck = true) {
        this.cli = cli;
        this.comm = comm;
        this.msg = msg;
        this.exec = exec;
        this.node = node;
        this.ls = node.middleware.arr;
        this.permCheck = permCheck;
        this.index = 0;
    }

    next(bool) {
        if(bool || (!this.permCheck && (!this.ls.length || this.index >= this.ls.length-1))) {
            if(this.argCheck())
                this.exec(this.cli, this.comm, this.msg);
        } else if(this.index >= this.ls.length-1 && this.permCheck) {
            if(this.msg.guild.members.cache.get(this.cli.discordCli.user.id).permissions.has(this.node.BotPermissions) || this.msg.guild.members.cache.get(client.discordCli.user.id).permissions.has(FLAGS.ADMINISTRATOR)) {
                if(this.msg.member.permissions.has(this.node.UserPermissions) || this.msg.member.permissions.has(FLAGS.ADMINISTRATOR)){
                    this.permCheck = false;
                    this.next();
                } else this.err("Insufficient user permissions to execute this command!", "nodePermissionFail");
            } else this.err("Insufficient bot permissions to execute this command!", "nodePermissionFail");
        } else {
            this.ls[this.index](this.cli, this.comm, this.msg, this.next, this);
            ++this.index;
            this.next();
        }
    }

    argCheck() {
        if(!this.node.HasArgs || (this.comm.Args.length === 0 && !this.node.ArgsRequired)){
            return true;
        }

        for (let i = 0; i < this.node.Args.length; i++) {
            const arg = this.node.Args[i];
            if(this.comm.Args[i] === undefined){
                if(!arg.optional){
                    this.err(`You are missing the argument \`${arg.name}\`${arg.type !== "any" ? " of type `" + arg.type + "`" : ""}`);
                    return false;
                } else return true;
            }

            if(Array.isArray(arg.type)) {
                let bool = false;
                let failed = [];
                if(this.comm.Args[i] === undefined && arg.optional) {
                    bool = true;
                }

                if(!bool)
                    arg.type.forEach(v => {
                        if(this.comm.Args[i].Type === v) bool = true;
                        else failed.push(v);
                    });

                if(!bool) {
                    this.err(`The argument \`${this.comm.Args[i].Value}\` needs to be of type \`${failed.join("`, `")}\` not \`${this.comm.Args[i].Type}\``);
                    return false;
                }
            } else {
                if(arg.type !== "any"  && (this.comm.Args[i].Type !== arg.type && (this.comm.Args[i] !== undefined || !arg.optional))){
                    this.err(`The argument \`${this.comm.Args[i].Value}\` needs to be of type \`${arg.type}\` not \`${this.comm.Args[i].Type}\``);
                    return;
                }
            }
        }
        return true;
    }

    err(discordMsg, ev) {
        if(this.msg.guild.member(this.cli.discordCli.user).hasPermission("SEND_MESSAGES"))
                msg.reply(discordMsg);
        else if(ev) this.cli.emit(ev, this.cli, this.comm, this.msg);
    }
}