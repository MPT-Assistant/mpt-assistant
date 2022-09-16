import DB from "../../lib/DB";
import { IChat, IUser } from "../../lib/DB/VK/types";

import VK from "./";

class UtilsVK {
    constructor(private readonly _bot: VK) {}

    public async getUserData(
        id: number,
    ): Promise<IUser> {
        const userData = await DB.vk.models.users.findOne({ id });
        if (userData === null) {
            const response = await this._bot.instance.api.users.get({ user_id: id.toString() });
            const userInfo = response[0] as { first_name: string };
            const newUser = await DB.vk.models.users.create({
                id,
                nickname: userInfo.first_name,
                mailings: { replacements: true },
                regDate: new Date(),
            });
            return newUser;
        }
        return userData;
    }

    public async getChatData(
        id: number,
    ): Promise<IChat> {
        const chatData = await DB.vk.models.chats.findOne({ id });
        if (!chatData) {
            const newChatData = await DB.vk.models.chats.create({
                id,
                mailings: { replacements: true },
            });
            return newChatData;
        }
        return chatData;
    }

}

export default UtilsVK;
