import { Keyboard } from "vk-io";

import utils from "../../../../utils";

import VKBotTextCommand from "../../../utils/TextCommand";

new VKBotTextCommand({
	alias: ["профиль", "проф"],
	handler: async (context) => {
		if (!context.state.user.group) {
			return context.reply(
				`Ваш профиль:
ID: ${context.senderId}
Группа: Не установлена`,
			);
		}

		const keyboard = Keyboard.builder().textButton({
			label: `${
				context.state.user.inform ? "Отключить" : "Включить"
			} уведомления`,
			payload: {
				cmd: `изменения ${
					context.state.user.inform ? "отключить" : "включить"
				}`,
			},
			color: context.state.user.inform
				? Keyboard.NEGATIVE_COLOR
				: Keyboard.POSITIVE_COLOR,
		});

		const { group, specialty } = await utils.mpt.getExtendGroupInfo(
			context.state.user.group,
		);

		const groupLeaders = specialty.groupsLeaders.find(
			(x) => x.name === group.name,
		);

		keyboard.row().urlButton({
			label: "Сайт отделения",
			url: specialty.url,
		});

		return context.reply(
			`Ваш профиль:
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
				keyboard: keyboard.inline(),
			},
		);
	},
});
