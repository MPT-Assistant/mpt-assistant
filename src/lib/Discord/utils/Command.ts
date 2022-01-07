import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

import discordUtils from "./index";

type TCommandHandler = (interaction: CommandInteraction) => unknown;

interface ICommandParams {
	name: string;
	description: string;
	handler: TCommandHandler;
}

class Command extends SlashCommandBuilder {
	public readonly handler: TCommandHandler;

	constructor({ name, description, handler }: ICommandParams) {
		super();
		this.handler = handler;
		this.setName(name);
		this.setDescription(description);
		discordUtils.commandsList.push(this);
	}
}

export default Command;
