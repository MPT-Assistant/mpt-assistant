import { ExtractDoc } from "ts-mongoose";
import moment from "moment";

import DB from "../../DB";
import utils from "../../utils";

import TextCommand from "./TextCommand";
import CallbackCommand from "./CallbackCommand";

import { InlineKeyboard } from "puregram";
import { TelegramInlineKeyboardButton } from "puregram/lib/telegram-interfaces";

class UtilsTelegram {
	public textCommands: TextCommand[] = [];
	public callbackCommands: CallbackCommand[] = [];

	public async getUserData(
		id: number,
	): Promise<ExtractDoc<typeof DB.telegram.schemes.userSchema>> {
		let data = await DB.telegram.models.user.findOne({
			id,
		});
		if (!data) {
			data = new DB.telegram.models.user({
				id,
				ban: false,
				group: "",
				inform: true,
				reportedReplacements: [],
				regDate: new Date(),
			});
			await data.save();
		}
		return data;
	}

	public async getChatData(
		id: number,
	): Promise<ExtractDoc<typeof DB.telegram.schemes.chatSchema>> {
		let data = await DB.telegram.models.chat.findOne({
			id,
		});
		if (!data) {
			data = new DB.telegram.models.chat({
				id,
				group: "",
				inform: true,
				reportedReplacements: [],
			});
			await data.save();
		}
		return data;
	}

	public generateKeyboard(
		cmd: "lessons" | "replacements",
	): TelegramInlineKeyboardButton[][] {
		return [
			[
				InlineKeyboard.textButton({
					text: "ПН",
					payload: {
						cmd,
						date: utils.rest.getNextSelectDay("понедельник"),
					},
				}),
				InlineKeyboard.textButton({
					text: "ВТ",
					payload: {
						cmd,
						date: utils.rest.getNextSelectDay("вторник"),
					},
				}),
				InlineKeyboard.textButton({
					text: "СР",
					payload: {
						cmd,
						date: utils.rest.getNextSelectDay("среда"),
					},
				}),
			],
			[
				InlineKeyboard.textButton({
					text: "ЧТ",
					payload: {
						cmd,
						date: utils.rest.getNextSelectDay("четверг"),
					},
				}),
				InlineKeyboard.textButton({
					text: "ПТ",
					payload: {
						cmd,
						date: utils.rest.getNextSelectDay("пятница"),
					},
				}),
				InlineKeyboard.textButton({
					text: "СБ",
					payload: {
						cmd,
						date: utils.rest.getNextSelectDay("суббота"),
					},
				}),
			],
			[
				InlineKeyboard.textButton({
					text: "Вчера",
					payload: {
						cmd,
						date: moment().subtract(1, "day").format("DD.MM.YYYY"),
					},
				}),
				InlineKeyboard.textButton({
					text: "Завтра",
					payload: {
						cmd,
						date: moment().add(1, "day").format("DD.MM.YYYY"),
					},
				}),
			],
		];
	}
}

export default new UtilsTelegram();
