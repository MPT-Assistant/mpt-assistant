import DB from "../lib/DB";

import VK from "./VK";

class BotsManager {
    public readonly vk: VK;

    constructor() {
        this.vk = new VK(DB.config.vk);
    }

    public start(): Promise<void> {
        return this.vk.start();
    }
}

export default new BotsManager();
