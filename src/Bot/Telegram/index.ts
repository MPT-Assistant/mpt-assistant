import { Telegram } from "puregram";
import { TelegramOptions } from "puregram/lib/types/interfaces.d";

import Bot from "../Bot";

import UtilsTelegram from "./utils";

class TelegramBot extends Bot {
    public readonly instance: Telegram;

    public readonly utils: UtilsTelegram;

    constructor(options: Partial<TelegramOptions>) {
        super();
        this.instance = new Telegram(options);
        this.utils = new UtilsTelegram(this);
    }

    public start(): Promise<boolean> {
        return this.instance.updates.startPolling();
    }
}

export default TelegramBot;
