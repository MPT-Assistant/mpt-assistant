import config from "../../DB/config";

import VKDB from "./VK";
import TelegramDB from "./Telegram";
import APIDB from "./API";

class DB {
    public readonly config = Object.freeze(config);

    public readonly vk = new VKDB(this.config.db.mongo);
    public readonly telegram = new TelegramDB(this.config.db.mongo);
    public readonly api = new APIDB(this.config.db.mongo);

    public async init(): Promise<void> {
        await Promise.all([
            this.vk.connection.asPromise(),
            this.telegram.connection.asPromise(),
            this.api.connection.asPromise(),
        ]);
    }
}

export default new DB();
