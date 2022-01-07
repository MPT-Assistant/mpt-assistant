import { Interaction } from "discord.js";
import discordUtils from "../utils";

async function interactionCreateHandler(
	interaction: Interaction,
): Promise<void> {
	if (!interaction.isCommand()) return;

	const command = discordUtils.commandsList.find(
		(x) => x.name === interaction.commandName,
	);

	if (command) {
		await command.handler(interaction);
	}
}

export default interactionCreateHandler;
