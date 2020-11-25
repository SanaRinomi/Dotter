const pg = require("./dbKnex");

class Cache {
    constructor(TTL = 120) {
        this.map = new Map();
        this.TTL = TTL;
    }

    fetch(id, filter) {
        const cache = this.map.get(id);

        if(filter) {
            const filteredCache = this.fetch({id, filter: filter.join("_")});

            if(filteredCache && (filteredCache.time - Date.now()) > 0) return filteredCache.data;
            if(!filteredCache && !cache) return null;
            else if((cache.time - Date.now()) > 0){
                let arr = [];

                for (let i = 0; i < cache.data.length; i++) {
                    const cachedElem = cache.data[i];
                    let obj = {};

                    for (let i = 0; i < filter.length; i++) {
                        const val = filter[i];
                        obj[val] = cachedElem[val];
                    }

                    arr.push(obj);
                }

                this.add(id, arr, filter);
                return arr;
            } else {
                this.delete(id);
                return null;
            }
        } else {
            if(!cache) return null;
            else if((cache.time - Date.now()) < 0) {
                this.delete(id);
                return null;
            }
            else return cache.data;
        }
    }

    add(id, data, filter) {
        const now = new Date();
        this.map.set(filter ? {id, filter: filter.join("_")} : id , {time: new Date(now.getTime() + (this.TTL * 1000)), data});
    }

    delete(id) {
        this.map.delete(id);
    }
}

/**
 * @callback tableCallback
 * @param {object} table - Schema table object.
 */

/**
 * Database table object.
 */
class DBTable {
    /**
     * 
     * @param {string} tablename - Name of the table
     * @param {tableCallback} table - Callback function used to create the table. 
     * @param {boolean} [auto_create=true] - Check and create the table automatically.
     */
    constructor(tablename, table = function(table){
        table.bigInteger("id").unsigned().primary();
    }, auto_create = true) {
        this._name = tablename;
        this._table = table;
        this._generatedID = false;
        this._timestamp = null;
        this._cache = false;
        this._CacheObj = new Cache();
        if(auto_create) this.create();
    }

    /**
     * Create the DB table.
     * @param {boolean} [check=true] - Check whether or not the table exists. 
     */
    async create(check = true) {
        if(check && await pg.schema.hasTable(this._name)) return;
        await pg.schema.createTable(this._name, this._table);
    }

    /**
     * Deletes the table and recreates it.
     */
    async remake() {
        if(await pg.schema.hasTable(this._name))
            await pg.schema.dropTable(this._name);
        await this.create(false);
        return true;
    }

    /**
     * Delete a row off the DB table.
     * @param {*} id - ID of the row.
     * @param {?string} [field=id] - Column to check the ID value againts.
     */
    async del(id, field = null) {
        let res = await (Array.isArray(id) ? pg(this._name).whereIn(field ? field : "id", id).del() : pg(this._name).where(field ? field : typeof id === "object" ? id : {id}, field ? typeof id === "object" ? id : {id} : undefined).del());
        
        if(res)
            return true;
        else return false;
    }

    /**
     * Find out whether or not a row exists with value given in the desired column.
     * @param {string} name - Name of the column.
     * @param {*} value - Value to look for.
     */
    async find(name, value) {
        let obj = {};
        obj[name] = value;
        let res = await pg.from(this._name).select().where(obj);
        return res.length && res[0] ? true : false;
    }

    async get(id, data, returnArray = false) {
        let cache;
        
        if(this._cache) cache = this._CacheObj.fetch(id, data);
        let res = cache ? cache : await pg.from(this._name).select(data).where(typeof id === "object" ? id : {id});
        
        if(res.length && res[0]) {
            if(this._cache && !cache) this._CacheObj.add(id, res, data);
            return {id: id, success: true, data: returnArray ? res : res[0]};
        }
        else return {id: id, success: false};
    }

    async getAll(data = null) {
        let res = await pg.from(this._name).select(data);
        if(res.length && res[0])
            return {success: true, data: res};
        else return {success: false};
    }

    async upsert(id, data = {}, onlyUpdate = false) {
        let res, cache;
        
        if(this._cache && id !== null) cache = this._CacheObj.fetch(id);
        if(id !== null) res = cache ? cache : await pg.from(this._name).select(!this._generatedID && typeof id === "object" ? Object.keys(id) : ["id"]).where(typeof id === "object" ? id : {id});

        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const element = data[key];
                if(typeof element === "object")
                data[key] = JSON.stringify(element);
            }
        }

        if(res && res.length && res[0]) {
            if(this._timestamp) data[this._timestamp] = pg.fn.now();
            res = await pg(this._name).where(!this._generatedID ? typeof id === "object" ? id : {id} : {id: res[0].id}).update(data, typeof id === "object" ? Object.keys(id) : ["id"]);
        } else if(!onlyUpdate) {
            res = await pg(this._name).returning(!this._generatedID && typeof id === "object" ? Object.keys(id) : ["id"]).insert(id ? typeof id === "object" ? {...id, ...data} : {id, ...data} : data);
        } else { res = {success: false}; }

        if(Array.isArray(res) && res.length)
            return {success: true, data: res.length > 1 || onlyUpdate ? res : res[0]};
        else return {success: false};
    }

    async insert(data, returning = ["id"]) {
        let clean = (dirtyData) => {
            for (const key in data) {
                if (dirtyData.hasOwnProperty(key)) {
                    const element = dirtyData[key];
                    if(typeof element === "object")
                    dirtyData[key] = JSON.stringify(element);
                }
            }
            return dirtyData;
        };

        data = Array.isArray(data) ? data.map(v => clean(v)) : clean(data);        

        let res = await pg(this._name).returning(returning).insert(data);
        
        if(Array.isArray(res) && res.length)
            return {success: true, data: res};
        else return {success: false};
    }
}

/** Class form managing settings */
class SettingsTables extends DBTable{
    /**
     * Manage and create DB settings tables.
     * @param {string} name - Settings table name.
     * @param {string} constraint_name Constraints table name.
     */
    constructor(name = "settings", constraint_name = "allowed_setting_values") {
        super(name, [table => {
            table.increments("id");
            table.string("name").notNullable();
            table.string("description");
            table.string("data_type").notNullable();
            table.string("min_value");
            table.string("max_value");
            table.boolean("constrained").defaultTo(false);
        }, table => {
            table.increments("id");
            table.integer("setting_id").unsigned().references(`${name}.id`);
            table.string("value").notNullable();
            table.string("name").notNullable();
            table.string("description");
        }], false);
        this._constraintName = constraint_name;

        this.create();
    }

    /**
     * Create the DB tables.
     * @param {boolean} check - Check if tables already exist.
     */
    async create(check = true) {
        if(!check || await pg.schema.hasTable(this._name))
            await pg.schema.createTable(this._name, this._table[0]);

        if(!check || await pg.schema.hasTable(this._constraintName))
            await pg.schema.createTable(this._constraintName, this._table[1]);
    }

    /**
     * Get a constraint from the DB.
     * @param {number} id - Constraint ID.
     */
    async getConstraint(id) {
        let cache, cacheID = `${id}-constraint`;
        
        if(this._cache) cache = this._CacheObj.fetch(cacheID, data);
        let res = cache ? cache : await pg.from(this._constraintName).select(data).where(typeof id === "object" ? id : {id});
        
        if(res.length && res[0]) {
            if(this._cache && !cache) this._CacheObj.add(cacheID, res, data);
            return {id: id, success: true, data: returnArray ? res : res[0]};
        }
        else return {id: id, success: false};
    }

    /**
     * Get all constraints related to a setting.
     * @param {number} id - Setting ID.
     */
    async getConstraints(id) {
        let res = await pg.from(this._constraintName).select(data).where({setting_id: id});
        
        if(res.length && res[0])
            return {id: id, success: true, data: res};
        else return {id: id, success: false};
    }

    /**
     * Insert constraint data into DB.
     * @param {object} data - Data to insert.
     * @param {string[]} [returning=["id"]] - Returning values from the insert.
     */
    async insertConstraint(data, returning = ["id"]) {
        let clean = (dirtyData) => {
            for (const key in data) {
                if (dirtyData.hasOwnProperty(key)) {
                    const element = dirtyData[key];
                    if(typeof element === "object")
                    dirtyData[key] = JSON.stringify(element);
                }
            }
            return dirtyData;
        };

        data = Array.isArray(data) ? data.map(v => clean(v)) : clean(data);        

        let res = await pg(this._constraintName).returning(returning).insert(data);
        
        if(Array.isArray(res) && res.length)
            return {success: true, data: res};
        else return {success: false};
    }
}

class LinkingTable extends DBTable {
    constructor(name, referenceXName, referenceXLink, referenceYName, referenceYLink, extraData = null, gen = true) {
        super(name, table => {
            if(gen || !extraData) {
                table.integer(referenceXName).unsigned().references(referenceXLink).notNullable();
                table.integer(referenceYName).unsigned().references(referenceYLink).notNullable();
            }
            
            if(extraData) extraData(table);
        });
        this.refX = {name: referenceXName, link: referenceXLink, table: referenceXLink.split(".").shift()};
        this.refY = {name: referenceYName, link: referenceYLink, table: referenceYLink.split(".").shift()};
        this._cache = true;
        this._extraData = extraData ? true : false;
    }

    insert(data, returning = undefined) {
        return this._extraData ? super.insert(data, returning) : super.insert(data, [this.refX.name, this.refY.name]);
    }

    async link(idX, idY, join = true) {
        let arr = Array.isArray(idX) ? {array: {...this.refX, data: idX}, ref: {...this.idY, data: idY}} : Array.isArray(idY) ? {array: {...this.refY, data: idY}, ref: {...this.refX, data: idX}} : null;
        if(arr) {
            let jRes = await this.getLinked(arr.array.table, arr.ref.data);
            if(jRes.success) {
                if(!join) {
                    let rem = jRes.data.map(v => {
                        return {
                            id: v,
                            notPresent: !arr.array.data.includes(v)
                        };
                    }).filter(v => v.notPresent).map(v => v.id);
                    let works = await pg(this._name).whereIn(arr.array.name, rem).andWhere(function() {this.where(arr.ref.name, arr.ref.data);}).del();
                }

                let add = arr.array.data.map(v => {
                    return {
                        id: v,
                        notPresent: jRes.data.includes(v)
                    };
                }).filter(v => v.notPresent).map(v => {
                    let addObj = {};
                    addObj[arr.ref.name] = arr.id;
                    addObj[arr.array.name] = v;
                    return addObj;
                });

                const insert = await this.insert(add, [this.refX.name, this.refY.name]);
                return insert;
            } else {
                const insert = await this.insert(arr.array.data.map(v => {
                    let addObj = {};
                    addObj[arr.ref.name] = arr.ref.data;
                    addObj[arr.array.name] = v;
                    return addObj;
                }), [this.refX.name, this.refY.name]);
                return insert;
            }
        } else {
            let obj = {};
            obj[this.refX.name] = idX;
            obj[this.refY.name] = idY;
            const check = await this.get(obj);
            return check.success ? {success: true} : await this.insert(obj, [this.refX.name, this.refY.name]);
        }
    }

    async getLinked(table, id, returnData = true) {
        let obj = {}, filter = "";
        if(table === this.refX.table)
            {obj[this.refY.name] = id; filter = this.refX.name;}
        else if(table === this.refY.table) 
            {obj[this.refX.name] = id; filter = this.refY.name;}
        else throw Error(table + " is not linked here");
        const res = await this.get(obj, [filter], true);
        if(res.success) {
            return {id, success: true, data: (returnData && this._extraData) ? res.data : res.data.map(v => v[filter])};
        } else return {id, success: false};
    }

    async removeLinked(idX, idY) {
        let obj = {};
        obj[this.refX.name] = idX;
        obj[this.refY.name] = idY;
        return await this.del(obj);
    }

    async removeAllLinked(table, id) {
        let obj = {};
        if(table === this.refX.table)
            obj[this.refY.name] = id;
        else if(table === this.refY.table) 
            obj[this.refX.name] = id;
        else throw Error(table + " is not linked here");

        return await this.del(obj);
    }
}

module.exports = {Table:DBTable,LinkingTable};