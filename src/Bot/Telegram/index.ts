import { Telegram } from "puregram";
import { TelegramOptions } from "puregram/lib/types/interfaces.d";

import Bot from "../Bot";

class TelegramBot extends Bot {
    public readonly instance: Telegram;

    constructor(options: Partial<TelegramOptions>) {
        super();
        this.instance = new Telegram(options);
    }

    public start(): Promise<boolean> {
        return this.instance.updates.startPolling();
    }
}

export default TelegramBot;
