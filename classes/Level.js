const expGrade = 2;
const expMulti = 2;

function ReqObj(currReq = 0, nextReq = SimpleLevels.expRequirements(1), percentage  = 0) {
    return {
        current: currReq,
        next: nextReq,
        percentage
    };
}

class Level {
    constructor(exp = 0, level = 0, expMulti = 2) {
        exp = exp > 0 ? exp : 0;
        level = level > 0 ? level : 0;

        this.expM = expMulti;
        this.experience = exp;
        this.currentLvl = level;
        this.expRequirements = {
            current: 0,
            next: 0,
            completed: 0
        };

        this.updateRequirements(true);
    }

    updateRequirements(bool) {
        if(bool) {
            this.expRequirements.current = Level.levelRequirement(this.currentLvl, this.expM);
            this.expRequirements.next = Level.levelRequirement(this.currentLvl + 1, this.expM);    
        }
        this.expRequirements.completed = ((this.experience-this.expRequirements.current)*100)/(this.expRequirements.next-this.expRequirements.current);
    }

    async increaseExp(exp) {
        this.experience += exp;
        let lvlUp = false;
        
        while(this.experience > this.expRequirements.next) {
            this.currentLvl += 1;
            this.expRequirements.next = Level.levelRequirement(this.currentLvl + 1, this.expM);
            lvlUp = true;
        }

        while(this.experience < this.expRequirements.current) {
            this.currentLvl -= 1;
            this.expRequirements.current = Level.levelRequirement(this.currentLvl - 1, this.expM);
            lvlUp = true;
        }
    
        if(lvlUp) this.updateRequirements(true);
        else this.updateRequirements();
    
        return lvlUp ? this.currentLvl : null;
    }

    static levelRequirement(level, exponential) {
        let exp = 0;
    
        for (let i = 1; i <= level; i++) {
            exp += Math.pow(i*10, exponential);
        }
    
        return exp;
    }

    toJSON() {
        return {
            exp: this.experience,
            level: this.currentLvl,
            expMulti: this.expM,
            req: this.expRequirements
        };
    }

    static fromJSON(json) {return new Level(json.exp, json.level, json.expMulti);}
}

class SimpleLevels {
    get experience () {return this._currExp; }
    set experience (v) {
        this._currExp = v;
        let lvlChange = false;
        
        while(v > this._reqs.next) {
            this._currLvl += 1;
            this._reqs.next = SimpleLevels.expRequirements(this._currLvl + 1);
            lvlChange = true;
        }

        while(v < this._reqs.current) {
            this._currLvl -= 1;
            this._reqs.current = SimpleLevels.expRequirements(this._currLvl - 1);
            lvlChange = true;
        }

        if(lvlChange) this.updateAll();
        else this.updatePercentage();
    }

    constructor (exp = 0, level = 0) {
        this._currLvl = level;
        this._currExp = exp;
        this._reqs = ReqObj();

        this.updateAll();
    }

    async addExperience(exp) {
        this._currExp += exp;
        let lvlChange = false;
        
        while(this._currExp > this._reqs.next) {
            this._currLvl += 1;
            this._reqs.next = SimpleLevels.expRequirements(this._currLvl + 1);
            lvlChange = true;
        }

        while(this._currExp < this._reqs.current) {
            this._currLvl -= 1;
            this._reqs.current = SimpleLevels.expRequirements(this._currLvl - 1);
            lvlChange = true;
        }
    
        if(lvlChange) this.updateAll();
        else this.updatePercentage();
    
        return lvlChange ? this._currLvl : null;
    }

    updatePercentage() {
        this._reqs.percentage = ((this._currExp-this._reqs.current)*100)/(this._reqs.next-this._reqs.current);
    }

    updateAll(exponential = expGrade) {
        this._reqs.current = SimpleLevels.expRequirements(this._currLvl, exponential);
        this._reqs.next = SimpleLevels.expRequirements(this._currLvl+1, exponential);
        this.updatePercentage();
    }

    static expRequirements(level, exponential = expGrade) {
        let exp = 0;
    
        for (let i = 1; i <= level; i++) {
            exp += Math.pow(i*expMulti, exponential);
        }
    
        return exp;
    }

    toString() {
        return `Level ${this._currLvl}: Exp ${this._currExp}`;
    }

    toStringAll() {
        return `Level ${this._currLvl}: Exp ${this._currExp}, Reqs (${this._reqs.percentage}% Complete: [Floor: ${this._reqs.current}, Ceiling: ${this._reqs.next}])`;
    }

    toJSON(reqs = false) {
        return !reqs ? {
            level: this._currLvl,
            exp: this._currExp
        } : {
            level: this._currLvl,
            exp: this._currExp,
            reqs: this._reqs
        };
    }

    static fromJSON(json) {return new SimpleLevels(json.exp, json.level);};
}

module.exports = {Level, SimpleLevels};