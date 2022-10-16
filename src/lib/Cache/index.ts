import DB from "../DB";
import { ICache } from "../DB/API/types";

import utils from "../utils";

class Week extends String {
    public get isNumerator(): boolean {
        return this.toLowerCase() === "числитель";
    }

    public get isDenominator(): boolean {
        return this.toLowerCase() === "знаменатель";
    }
}

class Cache {
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

    public get week(): Week {
        return new Week(this._cache.week);
    }

    public get lastUpdate(): ICache["lastUpdate"] {
        return this._cache.lastUpdate;
    }
}

export default new Cache();
