import { SlashCommandBuilder } from "@discordjs/builders";

import discordUtils from "./index";
import BotDiscord from "./types";

class TextCommand extends SlashCommandBuilder {
	public readonly isPrivate: boolean;
	public readonly handler: BotDiscord.TCommandHandler;

	constructor({
		name,
		description,
		handler,
		isPrivate,
	}: BotDiscord.ICommandParams) {
		super();
		this.isPrivate = isPrivate || false;
		this.handler = handler;
		this.setName(name);
		this.setDescription(description);
		discordUtils.commandsList.push(this);
	}
}

export default TextCommand;
