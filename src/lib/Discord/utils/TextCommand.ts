import { SlashCommandBuilder } from "@discordjs/builders";

import discordUtils from "./index";
import BotDiscord from "./types";

class TextCommand extends SlashCommandBuilder {
	public readonly isPrivate: boolean;
	public readonly handler: BotDiscord.TextCommand.TCommandHandler;

	constructor({
		name,
		description,
		handler,
		isPrivate,
	}: BotDiscord.TextCommand.ICommandParams) {
		super();
		this.isPrivate = isPrivate || false;
		this.handler = handler;
		this.setName(name);
		this.setDescription(description);
		discordUtils.textCommands.push(this);
	}
}

export default TextCommand;
