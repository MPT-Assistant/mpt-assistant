import Telegram from ".";

import { manager as callbackCommandsManager } from "./CallbackCommand";

class TelegramUtils {
    private readonly _bot: Telegram;
    public readonly callbackCommands: typeof callbackCommandsManager;

    constructor(bot: Telegram) {
        this._bot = bot;
        this.callbackCommands = callbackCommandsManager;
    }
}

export default TelegramUtils;
