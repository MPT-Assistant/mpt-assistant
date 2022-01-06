import moment from "moment";
import { InlineKeyboard } from "puregram";

import utils from "../../../../utils";
import DB from "../../../../DB";

import telegramUtils from "../../../utils";

import CallbackCommand from "../../../utils/CallbackCommand";

new CallbackCommand({
	event: "lessons",
	handler: async (context) => {
		const selectedDate = moment(
			context.queryPayload.date || moment(),
			"DD.MM.YYYY",
		);

		if (!selectedDate.isValid()) {
			return await context.answerCallbackQuery({
				show_alert: true,
				text: `Неверная дата ${context.queryPayload.date}`,
			});
		}

		if (selectedDate.day() === 0) {
			return await context.answerCallbackQuery({
				show_alert: true,
				text: `${selectedDate.format("DD.MM.YYYY")} воскресенье.`,
			});
		}

		const groupName =
			context.state.user.group ||
			(context.state.chat ? context.state.chat?.group : "");

		if (groupName === "") {
			return await context.answerCallbackQuery({
				show_alert: true,
				text: "Вы не установили свою группу.",
			});
		}

		const group = await DB.api.models.group.findOne({
			name: groupName,
		});

		if (!group) {
			return await context.answerCallbackQuery({
				show_alert: true,
				text: "Такой группы не найдено, попробуйте снова установить группу",
			});
		}

		const keyboard = telegramUtils.generateKeyboard("lessons");
		const schedule = await utils.mpt.getGroupSchedule(group, selectedDate);

		await context.message
			?.editMessageText(`${context.from?.username}, ${schedule.toString()}`, {
				reply_markup: InlineKeyboard.keyboard(keyboard),
			})
			.catch(() => null);
	},
});
