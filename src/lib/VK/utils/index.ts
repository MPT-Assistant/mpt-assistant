import moment from "moment";
import { ExtractDoc } from "ts-mongoose";
import { Keyboard, KeyboardBuilder, getRandomId } from "vk-io";

import utils from "../../utils";
import DB from "../../DB";
import VK from "../../VK";

import VKBotTextCommand from "./TextCommand";
import VKBotEventCommand from "./EventCommand";

class UtilsVK {
	public textCommands: VKBotTextCommand[] = [];
	public eventCommands: VKBotEventCommand[] = [];

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
				cmd: command,
				date: utils.rest.getNextSelectDay("понедельник"),
			},
			color: Keyboard.SECONDARY_COLOR,
		});
		builder.callbackButton({
			label: "ВТ",
			payload: {
				cmd: command,
				date: utils.rest.getNextSelectDay("вторник"),
			},
			color: Keyboard.SECONDARY_COLOR,
		});
		builder.callbackButton({
			label: "СР",
			payload: {
				cmd: command,
				date: utils.rest.getNextSelectDay("среда"),
			},
			color: Keyboard.SECONDARY_COLOR,
		});
		builder.row();
		builder.callbackButton({
			label: "ЧТ",
			payload: {
				cmd: command,
				date: utils.rest.getNextSelectDay("четверг"),
			},
			color: Keyboard.SECONDARY_COLOR,
		});
		builder.callbackButton({
			label: "ПТ",
			payload: {
				cmd: command,
				date: utils.rest.getNextSelectDay("пятница"),
			},
			color: Keyboard.SECONDARY_COLOR,
		});
		builder.callbackButton({
			label: "СБ",
			payload: {
				cmd: command,
				date: utils.rest.getNextSelectDay("суббота"),
			},
			color: Keyboard.SECONDARY_COLOR,
		});
		builder.row();
		builder.callbackButton({
			label: "Вчера",
			payload: {
				cmd: command,
				date: moment().subtract(1, "day").format("DD.MM.YYYY"),
			},
			color: Keyboard.NEGATIVE_COLOR,
		});
		builder.callbackButton({
			label: "Завтра",
			payload: {
				cmd: command,
				date: moment().add(1, "day").format("DD.MM.YYYY"),
			},
			color: Keyboard.POSITIVE_COLOR,
		});

		return builder;
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

		const keyboard = Keyboard.builder().inline();
		keyboard.textButton({
			label: "Расписание",
			payload: {
				cmd: `Расписание ${replacementDate}`,
			},
			color: Keyboard.SECONDARY_COLOR,
		});
		keyboard.row();
		keyboard.textButton({
			label: "Отключить рассылку",
			payload: {
				cmd: "Изменения отключить",
			},
			color: Keyboard.NEGATIVE_COLOR,
		});

		const userQuery = {
			group: replacement.group,
			inform: true,
			reportedReplacements: {
				$nin: [replacement.hash],
			},
		};

		for await (const user of DB.vk.models.user.find(userQuery)) {
			user.reportedReplacements.push(replacement.hash);
			user.markModified("reportedReplacements");

			try {
				await VK.api.messages.send({
					user_id: user.id,
					random_id: getRandomId(),
					message,
					keyboard,
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
				await VK.api.messages.send({
					chat_id: chat.id,
					random_id: getRandomId(),
					message,
					keyboard,
				});
			} catch (error) {
				chat.inform = false;
			}

			await chat.save();
		}
	}
}

export default new UtilsVK();
