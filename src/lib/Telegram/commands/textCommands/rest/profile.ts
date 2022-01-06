import { InlineKeyboard } from "puregram";

import utils from "../../../../utils";

import TextCommand from "../../../utils/TextCommand";

new TextCommand({
	alias: ["профиль", "проф"],
	handler: async (context) => {
		if (!context.state.user.group) {
			return context.reply(
				`Ваш профиль:
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
			[
				InlineKeyboard.textButton({
					text: `${
						context.state.user.inform ? "Отключить" : "Включить"
					} уведомления`,
					payload: "Such payload",
				}),
			],
			[
				InlineKeyboard.urlButton({
					text: "Сайт отделения",
					url: specialty.url,
				}),
			],
		]);

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
				reply_markup: keyboard,
			},
		);
	},
});
