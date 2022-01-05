import { Keyboard } from "vk-io";

import EventCommand from "../../../utils/vk/EventCommand";
import DB from "../../../DB";
import VK from "../../../VK";

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
			const keyboard = Keyboard.builder().inline();
			return await Promise.all([
				VK.api.messages.edit({
					conversation_message_id: event.conversationMessageId,
					peer_id: event.peerId,
					message: `Вы установили себе группу ${selectedGroup.name}\nОтделение: (${selectedGroup.specialty})`,
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
