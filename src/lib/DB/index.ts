import config from "../../DB/config";

import VKDB from "./VK";

class DB {
    public readonly config = Object.freeze(config);

    public readonly vk = new VKDB();

    public async init(): Promise<void> {
        await Promise.all([this.vk.connection.asPromise()]);
    }
}

export default new DB();
