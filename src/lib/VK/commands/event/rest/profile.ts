import { Keyboard } from "vk-io";

import utils from "../../../../utils";

import EventCommand from "../../../utils/EventCommand";

new EventCommand({
	event: "profile",
	handler: async (event) => {
		if (!event.state.user.group) {
			return await event.answer({
				type: "show_snackbar",
				text: `У вас не установлена группа`,
			});
		}

		const keyboard = Keyboard.builder().textButton({
			label: `${
				event.state.user.inform ? "Отключить" : "Включить"
			} уведомления`,
			payload: {
				cmd: `изменения ${event.state.user.inform ? "отключить" : "включить"}`,
			},
			color: event.state.user.inform
				? Keyboard.NEGATIVE_COLOR
				: Keyboard.POSITIVE_COLOR,
		});

		const { group, specialty } = await utils.mpt.getExtendGroupInfo(
			event.state.user.group,
		);

		const groupLeaders = specialty.groupsLeaders.find(
			(x) => x.name === group.name,
		);

		keyboard.row().urlButton({
			label: "Сайт отделения",
			url: specialty.url,
		});

		return await event.state.editParentMessage({
			message: `Ваш профиль:
ID: ${event.userId}
Группа: ${event.state.user.group}
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
				event.state.user.inform ? "Включено" : "Отключено"
			}`,
			keyboard: keyboard.inline(),
		});
	},
});
