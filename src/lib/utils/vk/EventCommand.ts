import { MessageEventContext } from "vk-io";

import BotVK from "./types";
import utils from "..";

class VKBotEventCommand {
	public readonly event: string;
	public readonly handler: (
		event: MessageEventContext<BotVK.GroupEventContextState>,
	) => Promise<unknown>;

	constructor({
		event,
		handler,
	}: {
		event: string;
		handler: (
			event: MessageEventContext<BotVK.GroupEventContextState>,
		) => Promise<unknown>;
	}) {
		this.event = event;
		this.handler = handler;
		utils.vk.eventCommands.push(this);
	}
}

export default VKBotEventCommand;
