import { CommandInteraction, Interaction } from "discord.js";
import discordUtils from "../utils";

import BotDiscord from "../utils/types";

async function interactionCreateHandler(
	interaction: Interaction,
): Promise<void> {
	if (!interaction.isCommand()) return;

	const command = discordUtils.commandsList.find(
		(x) => x.name === interaction.commandName,
	);

	if (command) {
		(
			interaction as CommandInteraction & { state: BotDiscord.IStateInfo }
		).state = {
			user: await discordUtils.getUserData(interaction.user.id),
			channel: interaction.channel
				? await discordUtils.getChatData(interaction.channel.id)
				: undefined,
			guild: interaction.guild
				? await discordUtils.getGuildData(interaction.guild.id)
				: undefined,
		};
		await command.handler(
			interaction as CommandInteraction & { state: BotDiscord.IStateInfo },
		);
	}
}

export default interactionCreateHandler;
