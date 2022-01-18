import { Keyboard } from "vk-io";

import VKBotTextCommand from "../../../utils/TextCommand";

import DB from "../../../../DB";

import utils from "../../../../utils";
import vkUtils from "../../../utils";

new VKBotTextCommand({
	alias: /^(?:расписание|рп|какие пары)(?:\s(.+))?$/i,
	handler: async (context) => {
		if (utils.cache.mpt.isScheduleNotAvailable) {
			if (context.state.chat?.schedule) {
				return await context.reply(
					`временное расписание
Установил: @id${context.state.chat.schedule.user}
Сейчас ${utils.cache.mpt.week} (${
						utils.cache.mpt.isNumerator ? "Сверху" : "Снизу"
					})`,
					{
						attachment: context.state.chat.schedule.image,
					},
				);
			} else if (context.state.user.schedule) {
				return await context.reply(
					`временное расписание
Сейчас ${utils.cache.mpt.week} (${
						utils.cache.mpt.isNumerator ? "Сверху" : "Снизу"
					})`,
					{
						attachment: context.state.user.schedule.image,
					},
				);
			} else {
				return await context.reply(
					`Расписание будет доступно, когда оно появится на сайте
Вы можете установить временное расписание командой set lessons`,
				);
			}
		}
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
		const keyboard = vkUtils.generateKeyboard("lessons");

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
