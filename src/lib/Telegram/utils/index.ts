import { ExtractDoc } from "ts-mongoose";
import moment from "moment";
import raUtils from "rus-anonym-utils";

import DB from "../../DB";
import utils from "../../utils";
import telegram from "../index";

import TextCommand from "./TextCommand";
import CallbackCommand from "./CallbackCommand";

import { InlineKeyboard, InlineQueryContext } from "puregram";
import {
	TelegramInlineKeyboardButton,
	TelegramInlineQueryResultArticle,
} from "puregram/generated";

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

	public async generateInlineQueryResult(ctx: InlineQueryContext): Promise<{
		results: TelegramInlineQueryResultArticle[];
		isGroupIsSet: boolean;
	}> {
		const response: TelegramInlineQueryResultArticle[] = [];

		response.push({
			type: "article",
			id: "week",
			input_message_content: {
				message_text: `${moment().format("DD.MM.YYYY")} ${
					utils.cache.mpt.isNumerator ? "числитель" : "знаменатель"
				}`,
			},
			title: "Неделя",
			description: "Показывает текущую неделю",
		});

		const userData = await this.getUserData(ctx.from.id);
		const group = await DB.api.models.group.findOne({
			name: userData.group,
		});

		if (group) {
			const selectedDate = moment();
			const schedule = await utils.mpt.getGroupSchedule(group, selectedDate);

			response.push({
				type: "article",
				id: "schedule",
				input_message_content: {
					message_text: schedule.toString(),
				},
				title: "Расписание",
				description: "Выводит расписание на текущий день",
			});

			if (schedule.replacements.length !== 0) {
				const { replacements } = schedule;

				let responseReplacementsText = "";
				for (let i = 0; i < replacements.length; ++i) {
					const replacement = replacements[i];
					responseReplacementsText += `Замена #${Number(i) + 1}:
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
					)}\n\n`;
				}

				response.push({
					type: "article",
					id: "replacements",
					input_message_content: {
						message_text: `На выбранный день ${selectedDate.format(
							"DD.MM.YYYY",
						)} для группы ${group.name} ${raUtils.string.declOfNum(
							replacements.length,
							["найдена", "найдено", "найдено"],
						)} ${replacements.length} ${raUtils.string.declOfNum(
							replacements.length,
							["замена", "замены", "замен"],
						)}:\n\n${responseReplacementsText}`,
					},
					title: "Замены",
					description: "Выводит замены на текущий день",
				});
			}
		}

		return {
			results: response,
			isGroupIsSet: !!group,
		};
	}

	public async onNewReplacement(
		replacement: ExtractDoc<typeof DB.api.schemes.replacementSchema>,
	): Promise<void> {
		const replacementDate = moment(replacement.date).format("DD.MM.YYYY");
		const message = `Обнаружена новая замена на ${replacementDate}
Группа: ${replacement.group}
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
				text: `Расписание ${replacementDate}`,
				payload: {
					cmd: "lessons",
					date: replacementDate,
				},
			}),
		];
		keyboard[1] = [
			InlineKeyboard.textButton({
				text: `Замены ${replacementDate}`,
				payload: {
					cmd: "replacements",
					date: replacementDate,
				},
			}),
		];
		keyboard[2] = [
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

		for await (const chat of DB.telegram.models.chat.find(chatQuery)) {
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
