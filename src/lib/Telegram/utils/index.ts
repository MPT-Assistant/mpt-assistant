import { ExtractDoc } from "ts-mongoose";
import moment from "moment";

import DB from "../../DB";
import utils from "../../utils";
import telegram from "../index";

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

	public async onNewReplacement(
		replacement: ExtractDoc<typeof DB.api.schemes.replacementSchema>,
	): Promise<void> {
		const replacementDate = moment(replacement.date).format("DD.MM.YYYY");
		const message = `Обнаружена новая замена на ${replacementDate}
Пара: ${replacement.lessonNum}
Заменяемая пара: ${replacement.oldLessonName}
Преподаватель: ${replacement.oldLessonTeacher}
Новая пара: ${replacement.newLessonName}
Преподаватель на новой паре: ${replacement.newLessonTeacher}
Добавлена на сайт: ${moment(replacement.addToSite).format(
			"HH:mm:ss | DD.MM.YYYY",
		)}
Обнаружена ботом: ${moment(replacement.detected).format(
			"HH:mm:ss | DD.MM.YYYY",
		)}`;

		const keyboard: TelegramInlineKeyboardButton[][] = [];
		keyboard[0] = [
			InlineKeyboard.textButton({
				text: "Расписание",
				payload: {
					cmd: "lessons",
					date: replacementDate,
				},
			}),
		];
		keyboard[1] = [
			InlineKeyboard.textButton({
				text: "Отключить уведомления",
				payload: {
					cmd: "notify",
					status: false,
				},
			}),
		];

		const userQuery = {
			group: replacement.group,
			inform: true,
			reportedReplacements: {
				$nin: [replacement.hash],
			},
		};

		for await (const user of DB.telegram.models.user.find(userQuery)) {
			user.reportedReplacements.push(replacement.hash);
			user.markModified("reportedReplacements");

			try {
				await telegram.api.sendMessage({
					chat_id: user.id,
					text: message,
					reply_markup: InlineKeyboard.keyboard(keyboard),
				});
			} catch (error) {
				user.inform = false;
			}

			await user.save();
		}

		const chatQuery = {
			group: replacement.group,
			inform: true,
			reportedReplacements: {
				$nin: [replacement.hash],
			},
		};

		for await (const chat of DB.vk.models.chat.find(chatQuery)) {
			chat.reportedReplacements.push(replacement.hash);
			chat.markModified("reportedReplacements");

			try {
				await telegram.api.sendMessage({
					chat_id: chat.id,
					text: message,
					reply_markup: InlineKeyboard.keyboard(keyboard),
				});
			} catch (error) {
				chat.inform = false;
			}

			await chat.save();
		}
	}
}

export default new UtilsTelegram();
