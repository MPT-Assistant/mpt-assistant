import DB from "../lib/DB";
import { IReplacement } from "../lib/DB/API/types";

import VK from "./VK";
import "./VK/commands/textLoader";
import "./VK/commands/eventLoader";

import Telegram from "./Telegram";
import "./Telegram/commands/textLoader";

import utils from "../lib/utils";

class BotsManager {
    public readonly vk: VK;
    public readonly telegram: Telegram;

    constructor() {
        this.vk = new VK(DB.config.vk);
        this.telegram = new Telegram(DB.config.telegram);
    }

    public async sendReplacement(replacement: IReplacement): Promise<void> {
        await Promise.all([this.vk.utils.sendReplacement(replacement)]);
    }

    public async start(): Promise<void> {
        utils.events.on("new_replacement", (replacement) => {
            void this.sendReplacement(replacement);
        });
        await Promise.all([this.vk.start(), this.telegram.start()]);
        return;
    }
}

export default new BotsManager();
