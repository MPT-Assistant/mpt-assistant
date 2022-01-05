import { MessageContext } from "vk-io";

import utils from "..";
import BotVK from "./types";

class VKBotTextCommand {
	public readonly regexp: RegExp;
	public readonly templates: string[];
	public readonly handler: (
		message: MessageContext<BotVK.GroupMessageContextState>,
	) => Promise<unknown>;

	constructor({
		alias,
		templates = [],
		handler,
	}: {
		alias: RegExp | string | string[];
		templates?: string[];
		handler: (
			message: MessageContext<BotVK.GroupMessageContextState>,
		) => Promise<unknown>;
	}) {
		if (typeof alias === "string") {
			alias = new RegExp(`^(?:${alias})$`, "i");
		}
		if (Array.isArray(alias)) {
			alias = new RegExp(`^(?:${alias.join("|")})$`, "i");
		}
		this.regexp = alias;
		this.templates = templates;
		this.handler = handler;

		utils.vk.textCommands.push(this);
	}

	public check(input: string): boolean {
		return this.regexp.test(input);
	}
}

export default VKBotTextCommand;
