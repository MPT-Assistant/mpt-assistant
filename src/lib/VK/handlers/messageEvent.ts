import { MessageEventContext } from "vk-io";
import BotVK from "../../utils/vk/types";

import utils from "../../utils";

export default async function messageEventHandler(
	event: MessageEventContext<BotVK.GroupEventContextState>,
) {
	if (!event.eventPayload || !event.eventPayload.type) {
		return;
	}

	const command = utils.vk.eventCommands.find(
		(x) => x.event === event.eventPayload.type,
	);

	if (!command) {
		return;
	}

	event.state = {
		user: await utils.vk.getUserData(event.userId),
		chat:
			event.peerId > 2e9
				? await utils.vk.getChatData(event.peerId - 2e9)
				: undefined,
	};

	try {
		await command.handler(event);
		await event.state.user.save();
		if (event.state.chat) {
			event.state.chat.save();
		}
		return;
	} catch (err) {
		return await event.answer({
			type: "show_snackbar",
			text: "Ошиб очка",
		});
	}
}
