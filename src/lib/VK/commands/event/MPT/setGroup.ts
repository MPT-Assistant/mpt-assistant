import { Keyboard } from "vk-io";

import EventCommand from "../../../../utils/vk/EventCommand";
import DB from "../../../../DB";

new EventCommand({
	event: "setGroup",
	handler: async (event) => {
		const selectedGroup = await DB.api.models.group.findOne({
			name: new RegExp(`^${event.eventPayload.group}$`, "i"),
		});

		if (!selectedGroup) {
			return await event.answer({
				type: "show_snackbar",
				text: `Группы ${event.eventPayload.group} не найдено`,
			});
		} else {
			event.state.user.group = selectedGroup.name;
			const keyboard = Keyboard.builder()
				.inline()
				.callbackButton({
					label: "Профиль",
					payload: {
						cmd: "profile",
					},
				});

			return await Promise.all([
				event.state.editParentMessage({
					message: `Вы установили себе группу ${selectedGroup.name}\nОтделение: ${selectedGroup.specialty}`,
					keyboard,
				}),
				event.answer({
					type: "show_snackbar",
					text: `Вы установили себе группу ${selectedGroup.name}.\n(${selectedGroup.specialty})`,
				}),
			]);
		}
	},
});
