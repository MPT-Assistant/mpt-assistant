import Telegram from ".";

import { manager as textCommandsManager } from "./TextCommand";
import { manager as callbackCommandsManager } from "./CallbackCommand";

class TelegramUtils {
    private readonly _bot: Telegram;
    public readonly textCommands: typeof textCommandsManager;
    public readonly callbackCommands: typeof callbackCommandsManager;

    constructor(bot: Telegram) {
        this._bot = bot;

        this.textCommands = textCommandsManager;
        this.callbackCommands = callbackCommandsManager;
    }
}

export default TelegramUtils;
