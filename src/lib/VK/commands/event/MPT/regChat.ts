import { Keyboard } from "vk-io";

import EventCommand from "../../../../utils/vk/EventCommand";
import DB from "../../../../DB";

new EventCommand({
	event: "regChat",
	handler: async (event) => {
		if (!event.state.chat) {
			return;
		}

		const selectedGroup = await DB.api.models.group.findOne({
			name: new RegExp(`^${event.eventPayload.group}$`, "i"),
		});

		if (!selectedGroup) {
			return await event.answer({
				type: "show_snackbar",
				text: `Группы ${event.eventPayload.group} не найдено`,
			});
		} else {
			event.state.chat.group = selectedGroup.name;

			await event.answer({
				type: "show_snackbar",
				text: `Вы установили чату группу ${selectedGroup.name}.\n(${selectedGroup.specialty})`,
			});

			return await event.state.editParentMessage({
				conversation_message_id: event.conversationMessageId,
				keyboard: Keyboard.builder(),
				message: `установил группу для чата по умолчанию\nГруппа: ${selectedGroup.name}\nОтделение: ${selectedGroup.specialty}`,
			});
		}
	},
});
