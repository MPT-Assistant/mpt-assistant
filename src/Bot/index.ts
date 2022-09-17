import DB from "../lib/DB";
import { IReplacement } from "../lib/DB/API/types";

import VK from "./VK";
import "./VK/commands/textLoader";
import "./VK/commands/eventLoader";

class BotsManager {
    public readonly vk: VK;

    constructor() {
        this.vk = new VK(DB.config.vk);
    }

    public async sendReplacement(replacement: IReplacement): Promise<void> {
        await Promise.all([this.vk.utils.sendReplacement(replacement)]);
    }

    public start(): Promise<void> {
        return this.vk.start();
    }
}

export default new BotsManager();
