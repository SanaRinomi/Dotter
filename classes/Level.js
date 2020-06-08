class Level {
    constructor(exp, level, expMulti = 2) {
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

        this.updateRequirements();
    }

    updateRequirements() {
        this.expRequirements.current = Level.levelRequirement(this.currentLvl);
        this.expRequirements.next = Level.levelRequirement(this.currentLvl + 1);
        this.expRequirements.completed = ((this.experience-this.expRequirements.current)*100)/this.expRequirements.next;
    }

    async increaseExp(exp) {
        this.experience += exp;
        let lvlUp = false;
        
        while(this.experience > this.expRequirements.next) {
            this.currentLvl += 1;
            this.expRequirements.next = Level.levelRequirement(this.currentLvl + 1);
            lvlUp = true;
        }

        while(this.experience < this.expRequirements.current) {
            this.currentLvl -= 1;
            this.expRequirements.current = Level.levelRequirement(this.currentLvl - 1);
            lvlUp = true;
        }
    
        if(lvlUp) this.updateRequirements();
    
        return lvlUp ? this.currentLvl : null;
    }

    static levelRequirement(level) {
        let exp = 0;
    
        for (let i = 1; i <= level; i++) {
            exp += Math.pow(5+i, this.expM);
        }
    
        return exp;
    }

    toJSON() {
        return {
            exp: this.experience,
            level: this.currentLvl,
            expMulti: this.expM
        };
    }

    static fromJSON(json) {return new Level(json.exp, json.level, json.expMulti);}
}

module.exports = Level;