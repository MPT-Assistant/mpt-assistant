import { Telegram } from "puregram";
import { TelegramOptions } from "puregram/lib/types/interfaces.d";

import Bot from "../Bot";

import UtilsTelegram from "./utils";
import HandlersTelegram from "./handlers";

class TelegramBot extends Bot {
    public readonly instance: Telegram;

    public readonly utils: UtilsTelegram;
    public readonly handlers: HandlersTelegram;

    constructor(options: Partial<TelegramOptions>) {
        super();
        this.instance = new Telegram(options);
        this.utils = new UtilsTelegram(this);
        this.handlers = new HandlersTelegram(this);

        this.handlers.bind(this.instance.updates);
    }

    public start(): Promise<boolean> {
        return this.instance.updates.startPolling();
    }
}

export default TelegramBot;
