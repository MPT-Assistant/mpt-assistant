import { InlineKeyboard } from "puregram";

import DB from "../../../../DB";

import utils from "../../../../utils";

import telegramUtils from "../../../utils";
import TextCommand from "../../../utils/TextCommand";

new TextCommand({
	alias: /^(?:расписание|рп|какие пары|schedule)(?:\s(.+))?$/i,
	handler: async (context) => {
		if (utils.cache.mpt.isScheduleNotAvailable) {
			return await context.reply(
				`Расписание будет доступно, когда оно появится на сайте`,
			);
		}
		const groupName =
			context.state.user.group ||
			(context.state.chat ? context.state.chat?.group : "");

		if (groupName === "") {
			return await context.reply(
				`Вы не установили свою группу.
Для установки своей группы введите команду: "Установить группу [Название группы]"${
					context.state.chat && context.state.chat.group === ""
						? `, либо же для установки стандартной группы для чата: "regchat [Название группы].`
						: ""
				}`,
			);
		}

		const groupData = await DB.api.models.group.findOne({
			name: groupName,
		});

		if (!groupData) {
			return await context.reply(
				"такой группы не найдено, попробуйте снова установить группу",
			);
		}

		const selectedDate = utils.rest.parseSelectedDate(context.state.args[1]);
		const keyboard = telegramUtils.generateKeyboard("lessons");

		if (selectedDate.day() === 0) {
			return await context.reply(
				`${selectedDate.format("DD.MM.YYYY")} воскресенье.`,
				{ reply_markup: InlineKeyboard.keyboard(keyboard) },
			);
		}

		const schedule = await utils.mpt.getGroupSchedule(groupData, selectedDate);

		if (schedule.lessons.length === 0) {
			return await context.reply(
				`на ${selectedDate.format("DD.MM.YYYY")} пар у группы ${
					groupData.name
				} не найдено`,
				{ reply_markup: InlineKeyboard.keyboard(keyboard) },
			);
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

		return await context.reply(schedule.toString(), {
			reply_markup: InlineKeyboard.keyboard(keyboard),
		});
	},
});
