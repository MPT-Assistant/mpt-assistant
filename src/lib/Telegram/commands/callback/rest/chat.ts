import { InlineKeyboard } from "puregram";

import utils from "../../../../utils";

import CallbackCommand from "../../../utils/CallbackCommand";

new CallbackCommand({
	event: "chat",
	handler: async (context) => {
		if (!context.state.chat) {
			return await context.message?.editMessageText(
				`${context.from?.username}, доступно только в беседах`,
			);
		}

		if (!context.state.chat.group) {
			return await context.message?.editMessageText(
				`${context.from?.username}, беседа #${context.message.chatId}
Группа: Не установлена`,
			);
		}

		const { group, specialty } = await utils.mpt.getExtendGroupInfo(
			context.state.chat.group,
		);

		const groupLeaders = specialty.groupsLeaders.find(
			(x) => x.name === group.name,
		);

		const keyboard = InlineKeyboard.keyboard([
			[
				InlineKeyboard.textButton({
					text: `${
						context.state.chat.inform ? "Отключить" : "Включить"
					} уведомления`,
					payload: {
						cmd: "notify",
						status: !context.state.chat.inform,
					},
				}),
			],
			[
				InlineKeyboard.urlButton({
					text: "Сайт отделения",
					url: specialty.url,
				}),
			],
		]);

		return await context.message?.editMessageText(
			`${context.from?.username}, беседа #${context.message.chatId}
Группа: ${context.state.chat.group}
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
				context.state.chat.inform ? "Включено" : "Отключено"
			}`,
			{
				reply_markup: keyboard,
			},
		);
	},
});
