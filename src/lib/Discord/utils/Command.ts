import { SlashCommandBuilder } from "@discordjs/builders";

import discordUtils from "./index";

class Command extends SlashCommandBuilder {
	constructor() {
		super();
		discordUtils.commandsList.push(this);
	}
}

export default Command;
