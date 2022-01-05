import moment from "moment";
import { ExtractDoc } from "ts-mongoose";
import { Keyboard, KeyboardBuilder } from "vk-io";

import utils from "..";
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

	public generateKeyboard(
		command: "lessons" | "replacements",
	): KeyboardBuilder {
		const builder = Keyboard.builder().inline();

		builder.callbackButton({
			label: "ПН",
			payload: {
				type: command,
				date: utils.rest.getNextSelectDay("понедельник"),
			},
			color: Keyboard.SECONDARY_COLOR,
		});
		builder.callbackButton({
			label: "ВТ",
			payload: {
				type: command,
				date: utils.rest.getNextSelectDay("вторник"),
			},
			color: Keyboard.SECONDARY_COLOR,
		});
		builder.callbackButton({
			label: "СР",
			payload: {
				type: command,
				date: utils.rest.getNextSelectDay("среда"),
			},
			color: Keyboard.SECONDARY_COLOR,
		});
		builder.row();
		builder.callbackButton({
			label: "ЧТ",
			payload: {
				type: command,
				date: utils.rest.getNextSelectDay("четверг"),
			},
			color: Keyboard.SECONDARY_COLOR,
		});
		builder.callbackButton({
			label: "ПТ",
			payload: {
				type: command,
				date: utils.rest.getNextSelectDay("пятница"),
			},
			color: Keyboard.SECONDARY_COLOR,
		});
		builder.callbackButton({
			label: "СБ",
			payload: {
				type: command,
				date: utils.rest.getNextSelectDay("суббота"),
			},
			color: Keyboard.SECONDARY_COLOR,
		});
		builder.row();
		builder.callbackButton({
			label: "Вчера",
			payload: {
				type: command,
				date: moment().subtract(1, "day").format("DD.MM.YYYY"),
			},
			color: Keyboard.NEGATIVE_COLOR,
		});
		builder.callbackButton({
			label: "Завтра",
			payload: {
				type: command,
				date: moment().add(1, "day").format("DD.MM.YYYY"),
			},
			color: Keyboard.POSITIVE_COLOR,
		});

		return builder;
	}
}

export default UtilsVK;
