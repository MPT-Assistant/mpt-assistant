import { InlineKeyboard } from "puregram";
import { PromptAnswer } from "@puregram/prompt";

import utils from "../../../../utils";

import TextCommand from "../../../utils/TextCommand";

new TextCommand({
	alias: /^(?:установить группу|уг|setGroup)(?:\s(.*))?$/i,
	handler: async (context) => {
		if (!context.state.args[1]) {
			let groupAnswer: PromptAnswer | undefined;

			while (!groupAnswer || !groupAnswer.text) {
				groupAnswer = await context.promptReply("Введите вашу группу");
			}

			context.state.args[1] = groupAnswer.text;
		}

		const group = await utils.mpt.findGroup(context.state.args[1]);

		if (Array.isArray(group)) {
			const responseText = `\nВозможно вы имели в виду какую то из этих групп:
${group.map((name, index) => `${index + 1}. ${name}`).join("\n")}`;

			const keyboard = InlineKeyboard.keyboard(
				group.map((name) => {
					return InlineKeyboard.textButton({
						text: name,
						payload: {
							cmd: "setGroup",
							group: name,
						},
					});
				}),
			);

			return await context.reply(
				`группы ${context.state.args[1]} не найдено, попробуйте ещё раз.${responseText}`,
				{ reply_markup: keyboard },
			);
		} else {
			context.state.user.group = group.name;
			return await context.reply(
				`Вы установили себе группу ${group.name}
Отделение: ${group.specialty}`,
				{
					reply_markup: InlineKeyboard.keyboard([
						InlineKeyboard.textButton({
							text: "Профиль",
							payload: {
								cmd: "profile",
							},
						}),
						InlineKeyboard.textButton({
							text: "Расписание",
							payload: {
								cmd: "lessons",
							},
						}),
						InlineKeyboard.textButton({
							text: "Замены",
							payload: {
								cmd: "replacements",
							},
						}),
					]),
				},
			);
		}
	},
});
