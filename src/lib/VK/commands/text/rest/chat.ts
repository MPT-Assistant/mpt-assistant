import { Keyboard } from "vk-io";

import utils from "../../../../utils";

import VKBotTextCommand from "../../../../utils/vk/TextCommand";

new VKBotTextCommand({
	alias: "чат",
	handler: async (context) => {
		if (!context.state.chat) {
			return context.reply("доступно только в беседах.");
		}

		if (!context.state.chat.group) {
			return context.reply(
				`беседа #${context.chatId}
Группа: Не установлена`,
			);
		}

		const keyboard = Keyboard.builder().textButton({
			label: `${
				context.state.chat.inform ? "Отключить" : "Включить"
			} уведомления`,
			payload: {
				cmd: `изменения ${
					context.state.chat.inform ? "отключить" : "включить"
				}`,
			},
			color: context.state.chat.inform
				? Keyboard.NEGATIVE_COLOR
				: Keyboard.POSITIVE_COLOR,
		});

		const { group, specialty } = await utils.mpt.getExtendGroupInfo(
			context.state.chat.group,
		);

		const groupLeaders = specialty.groupsLeaders.find(
			(x) => x.name === group.name,
		);

		keyboard.row().urlButton({
			label: "Сайт отделения",
			url: specialty.url,
		});

		return context.reply(
			`беседа #${context.chatId}
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
				keyboard: keyboard.inline(),
			},
		);
	},
});
