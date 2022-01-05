import { ExtractDoc } from "ts-mongoose";

import DB from "../../DB";
import VK from "../../VK";

import VKBotTextCommand from "./TextCommand";

class UtilsVK {
	public textCommands: VKBotTextCommand[] = [];

	public async getUserData(
		id: number,
	): Promise<ExtractDoc<typeof DB.vk.schemes.userSchema>> {
		const userData = await DB.vk.models.user.findOne({
			id,
		});
		if (!userData) {
			const [VK_USER_DATA] = await VK.api.users.get({
				user_id: id,
			});
			const newUserData = new DB.vk.models.user({
				id,
				nickname: VK_USER_DATA.first_name,
				group: "",
				ban: false,
				inform: false,
				regDate: new Date(),
				reportedReplacements: [],
			});
			await newUserData.save();
			return newUserData;
		}
		return userData;
	}

	public async getChatData(
		id: number,
	): Promise<ExtractDoc<typeof DB.vk.schemes.chatSchema>> {
		const chatData = await DB.vk.models.chat.findOne({
			id,
		});
		if (!chatData) {
			const newChatData = new DB.vk.models.chat({
				id,
				group: "",
				inform: false,
				reportedReplacements: [],
			});
			await newChatData.save();
			return newChatData;
		}
		return chatData;
	}
}

export default UtilsVK;
