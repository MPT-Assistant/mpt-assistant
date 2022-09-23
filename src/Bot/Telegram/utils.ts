import Telegram from ".";

import { manager as textCommandsManager } from "./TextCommand";
import { manager as callbackCommandsManager } from "./CallbackCommand";
import { IChat, IUser } from "../../lib/DB/Telegram/types";
import DB from "../../lib/DB";

class TelegramUtils {
    private readonly _bot: Telegram;
    public readonly textCommands: typeof textCommandsManager;
    public readonly callbackCommands: typeof callbackCommandsManager;

    constructor(bot: Telegram) {
        this._bot = bot;

        this.textCommands = textCommandsManager;
        this.callbackCommands = callbackCommandsManager;
    }

    public async getUserData(
        id: number,
    ): Promise<IUser> {
        const user = await DB.telegram.models.users.findOne({ id });
        if (user === null) {
            const newUser = await DB.telegram.models.users.create({
                id,
                mailings: { replacements: true },
                regDate: new Date(),
            });
            return newUser;
        }
        return user;
    }

    public async getChatData(
        id: number,
    ): Promise<IChat> {
        const chat = await DB.telegram.models.chats.findOne({ id, });
        if (chat === null) {
            const newChat = DB.telegram.models.chats.create({
                id,
                mailings: { replacements: true, },
            });
            return newChat;
        }
        return chat;
    }

}

export default TelegramUtils;
