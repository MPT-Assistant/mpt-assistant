import { APIError, MessageEventContext } from "vk-io";
import BotVK from "../../utils/vk/types";

import VK from "../index";
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
		editParentMessage: async (params) => {
			try {
				return await VK.api.messages.edit({
					peer_id: event.peerId,
					conversation_message_id: event.conversationMessageId,
					...params,
				});
			} catch (error) {
				if (error instanceof APIError) {
					if (error.code === 909) {
						await VK.api.messages.send({
							peer_id: event.peerId,
							forward: JSON.stringify({
								peer_id: event.peerId,
								conversation_message_id: event.conversationMessageId,
								is_reply: true,
							}),
							...params,
						});
						return 1;
					}
				}
				return event.answer({
					type: "show_snackbar",
					text: "Ошиб очка",
				});
			}
		},
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
