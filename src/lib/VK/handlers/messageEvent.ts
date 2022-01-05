import { APIError, MessageEventContext, getRandomId } from "vk-io";
import BotVK from "../utils/types";

import VK from "../index";
import vkUtils from "../utils";

export default async function messageEventHandler(
	event: MessageEventContext<BotVK.GroupEventContextState>,
): Promise<1 | undefined> {
	if (!event.eventPayload || !event.eventPayload.cmd) {
		return;
	}

	const command = vkUtils.eventCommands.find(
		(x) => x.event === event.eventPayload.cmd,
	);

	if (!command) {
		return;
	}

	event.state = {
		user: await vkUtils.getUserData(event.userId),
		chat:
			event.peerId > 2e9
				? await vkUtils.getChatData(event.peerId - 2e9)
				: undefined,
		editParentMessage: async (params) => {
			if (params.message) {
				params.message = `@id${event.senderId} (${event.state.user.nickname}), ${params.message}`;
			}

			try {
				return await VK.api.messages.edit({
					...params,
					peer_id: event.peerId,
					conversation_message_id: event.conversationMessageId,
					disable_mentions: true,
				});
			} catch (error) {
				if (error instanceof APIError) {
					if (error.code === 909) {
						await VK.api.messages.send({
							...params,
							random_id: getRandomId(),
							peer_id: event.peerId,
							forward: JSON.stringify({
								peer_id: event.peerId,
								conversation_message_ids: event.conversationMessageId,
								is_reply: true,
							}),
							disable_mentions: true,
						});
						await event.answer({
							type: "show_snackbar",
							text: "Отправлено в новом сообщении",
						});
						return;
					}
				}
				return;
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
