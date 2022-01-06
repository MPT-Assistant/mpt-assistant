import { InlineKeyboard } from "puregram";

import utils from "../../../../utils";

import CallbackCommand from "../../../utils/CallbackCommand";

new CallbackCommand({
	event: "profile",
	handler: async (context) => {
		if (!context.state.user.group) {
			return await context.message?.editMessageText(
				`${context.from?.username}, Ваш профиль:
ID: ${context.senderId}
Группа: Не установлена`,
			);
		}

		const { group, specialty } = await utils.mpt.getExtendGroupInfo(
			context.state.user.group,
		);

		const groupLeaders = specialty.groupsLeaders.find(
			(x) => x.name === group.name,
		);

		const keyboard = InlineKeyboard.keyboard([
			!context.state.chat
				? [
						InlineKeyboard.textButton({
							text: `${
								context.state.user.inform ? "Отключить" : "Включить"
							} уведомления`,
							payload: {
								cmd: "notify",
								status: !context.state.user.inform,
							},
						}),
				  ]
				: [],
			[
				InlineKeyboard.urlButton({
					text: "Сайт отделения",
					url: specialty.url,
				}),
			],
			[
				InlineKeyboard.textButton({
					text: "Расписание",
					payload: {
						cmd: "lessons",
					},
				}),
			],
			[
				InlineKeyboard.textButton({
					text: "Замены",
					payload: {
						cmd: "replacements",
					},
				}),
			],
		]);

		return await context.message?.editMessageText(
			`${context.from?.username}, Ваш профиль:
ID: ${context.senderId}
Группа: ${context.state.user.group}
Отделение: ${specialty.name}
${
	groupLeaders
		? `\nАктив группы:\n` +
		  groupLeaders.roles
				.map((item, index) => `${index + 1}. ${item.role} - ${item.name}`)
				.join("\n")
		: ""
}

Информирование о заменах: ${
				context.state.user.inform ? "Включено" : "Отключено"
			}`,
			{
				reply_markup: keyboard,
			},
		);
	},
});
