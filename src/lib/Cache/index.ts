import DB from "../DB";
import { ICache } from "../DB/API/types";

import utils from "../utils";

class Cache implements ICache {
    private _cache!: ICache;

    public async load(): Promise<void> {
        const cache = await DB.api.models.cache.findOne({});
        if (cache) {
            this._cache = cache;
        }
    }

    public async save(): Promise<void> {
        await DB.api.models.cache.updateOne({}, this._cache, { upsert: true });
    }

    public async update(): Promise<void> {
        try {
            const week = await utils.parser.getCurrentWeek();

            this._cache.week = week;
            this._cache.lastUpdate = new Date();
        
            await this.save();
        } catch (error) {
            //
        }
    }
    
    public get week(): ICache["week"] {
        return this._cache.week;
    }

    public get lastUpdate(): ICache["lastUpdate"] {
        return this._cache.lastUpdate;
    }
}

export default new Cache();
