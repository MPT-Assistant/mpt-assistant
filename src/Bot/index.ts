import DB from "../lib/DB";
import { IReplacement } from "../lib/DB/API/types";

import VK from "./VK";
import "./VK/commands/textLoader";
import "./VK/commands/eventLoader";
import utils from "../lib/utils";

class BotsManager {
    public readonly vk: VK;

    constructor() {
        this.vk = new VK(DB.config.vk);
    }

    public async sendReplacement(replacement: IReplacement): Promise<void> {
        await Promise.all([this.vk.utils.sendReplacement(replacement)]);
    }

    public start(): Promise<void> {
        utils.events.on("new_replacement", (replacement) => {
            void this.sendReplacement(replacement);
        });
        return this.vk.start();
    }
}

export default new BotsManager();
