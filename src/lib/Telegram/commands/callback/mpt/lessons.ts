import { InlineKeyboard } from "puregram";

import utils from "../../../../utils";
import DB from "../../../../DB";

import telegramUtils from "../../../utils";

import CallbackCommand from "../../../utils/CallbackCommand";

new CallbackCommand({
	event: "lessons",
	handler: async (context) => {
		const selectedDate = utils.rest.parseSelectedDate(
			context.queryPayload.date,
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

		if (schedule.lessons.length === 0) {
			return context.message
				?.editMessageText(
					`${context.from?.username}, на ${selectedDate.format(
						"DD.MM.YYYY",
					)} пар у группы ${groupName} не найдено`,
					{
						reply_markup: InlineKeyboard.keyboard(keyboard),
					},
				)
				.catch(() => null);
		}

		if (schedule.replacements.length !== 0) {
			keyboard.push([
				InlineKeyboard.textButton({
					text: "Замены",
					payload: {
						cmd: "replacements",
						date: selectedDate.format("DD.MM.YYYY"),
					},
				}),
			]);
		}

		await context.message
			?.editMessageText(`${context.from?.username}, ${schedule.toString()}`, {
				reply_markup: InlineKeyboard.keyboard(keyboard),
			})
			.catch(() => null);
	},
});
