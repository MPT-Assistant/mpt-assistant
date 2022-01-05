import { Keyboard } from "vk-io";
import rusAnonymUtils from "rus-anonym-utils";

import VKBotTextCommand from "../../../../utils/vk/TextCommand";

import DB from "../../../../DB";
import utils from "../../../../utils";

new VKBotTextCommand({
	alias: /^(?:расписание|рп|какие пары)(?:\s(.+))?$/i,
	handler: async (context) => {
		const groupName =
			context.state.user.group ||
			(context.state.chat ? context.state.chat?.group : "");

		if (groupName === "") {
			return await context.reply(
				`Вы не установили свою группу.
Для установки своей группы введите команду: "Установить группу [Название группы]"${
					context.isChat
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
				"Такой группы не найдено, попробуйте снова установить группу",
			);
		}

		const selectedDate = utils.rest.parseSelectedDate(context.state.args[1]);
		const keyboard = utils.vk.generateKeyboard("lessons");

		if (selectedDate.day() === 0) {
			return await context.reply(
				`${selectedDate.format("DD.MM.YYYY")} воскресенье.`,
				{ keyboard },
			);
		}

		const schedule = await utils.mpt.getGroupSchedule(groupData, selectedDate);

		if (schedule.lessons.length === 0) {
			return await context.reply(
				`на ${selectedDate.format("DD.MM.YYYY")} пар у группы ${
					groupData.name
				} не найдено`,
				{ keyboard },
			);
		}

		if (schedule.replacements.length !== 0) {
			keyboard.row();
			keyboard.callbackButton({
				label: "Замены",
				payload: {
					cmd: "replacements",
					date: selectedDate.format("DD.MM.YYYY"),
				},
				color: Keyboard.PRIMARY_COLOR,
			});
		}

		return await context.reply(schedule.toString(), { keyboard });
	},
});
