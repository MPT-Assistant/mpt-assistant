import { InlineKeyboard } from "puregram";

import DB from "../../../../DB";

import utils from "../../../../utils";

import telegramUtils from "../../../utils";
import TextCommand from "../../../utils/TextCommand";

new TextCommand({
	alias: /^(?:замены на|замены|replacements)(?:\s(.+))?$/i,
	handler: async (context) => {
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
		const keyboard = telegramUtils.generateKeyboard("replacements");

		if (selectedDate.day() === 0) {
			return await context.reply(
				`${selectedDate.format("DD.MM.YYYY")} воскресенье.`,
				{ reply_markup: InlineKeyboard.keyboard(keyboard) },
			);
		}

		const replacements = await utils.mpt.getGroupReplacements(
			groupData.name,
			selectedDate,
		);

		if (replacements.list.length === 0) {
			return await context.reply(
				`на ${selectedDate.format("DD.MM.YYYY")} замен у группы ${
					groupData.name
				} не найдено`,
				{ reply_markup: InlineKeyboard.keyboard(keyboard) },
			);
		} else {
			return await context.reply(replacements.toString(), {
				reply_markup: InlineKeyboard.keyboard(keyboard),
			});
		}
	},
});
