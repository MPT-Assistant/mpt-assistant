import moment from "moment";
import { InlineKeyboard } from "puregram";

import utils from "../../../../utils";

import telegramUtils from "../../../utils";

import CallbackCommand from "../../../utils/CallbackCommand";

new CallbackCommand({
	event: "replacements",
	handler: async (context) => {
		const selectedDate = moment(context.queryPayload.date, "DD.MM.YYYY");

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

		const keyboard = telegramUtils.generateKeyboard("replacements");
		const replacements = await utils.mpt.getGroupReplacements(
			groupName,
			selectedDate,
		);

		if (replacements.list.length === 0) {
			return await context.answerCallbackQuery({
				show_alert: true,
				text: `На ${selectedDate.format(
					"DD.MM.YYYY",
				)} замен у группы ${groupName} не найдено`,
			});
		}

		await context.message
			?.editMessageText(
				`${context.from?.username}, ${replacements.toString()}`,
				{
					reply_markup: InlineKeyboard.keyboard(keyboard),
				},
			)
			.catch(() => null);
	},
});
