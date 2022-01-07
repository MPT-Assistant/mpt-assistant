import { Interaction } from "discord.js";
import discordUtils from "../utils";

import BotDiscord from "../utils/types";

async function interactionCreateHandler(
	interaction: Interaction,
): Promise<void> {
	if (interaction.isCommand()) {
		const command = discordUtils.textCommands.find(
			(x) => x.name === interaction.commandName,
		);

		if (command) {
			(interaction as BotDiscord.TextCommand.Context).state = {
				user: await discordUtils.getUserData(interaction.user.id),
				channel: interaction.channel
					? await discordUtils.getChatData(interaction.channel.id)
					: undefined,
				guild: interaction.guild
					? await discordUtils.getGuildData(interaction.guild.id)
					: undefined,
			};
			await interaction.deferReply({ ephemeral: command.isPrivate });
			await command.handler(interaction as BotDiscord.TextCommand.Context);

			const state = (interaction as BotDiscord.TextCommand.Context).state;

			await state.user.save();
			state.channel ? await state.channel.save() : null;
			state.guild ? await state.guild.save() : null;
		}
	}

	if (interaction.isButton()) {
		const payload = JSON.parse(interaction.customId) || {};

		const command = discordUtils.callbackCommands.find(
			(x) => x.trigger === payload.cmd,
		);

			if (command) {
			(interaction as BotDiscord.CallbackCommand.Context).payload = payload;
			(interaction as BotDiscord.CallbackCommand.Context).state = {
				user: await discordUtils.getUserData(interaction.user.id),
				channel: interaction.channel
					? await discordUtils.getChatData(interaction.channel.id)
					: undefined,
				guild: interaction.guild
					? await discordUtils.getGuildData(interaction.guild.id)
					: undefined,
			};
			await interaction.deferUpdate();
			await command.handler(interaction as BotDiscord.CallbackCommand.Context);

			const state = (interaction as BotDiscord.CallbackCommand.Context).state;

			await state.user.save();
			state.channel ? await state.channel.save() : null;
			state.guild ? await state.guild.save() : null;
		}
	}
}

export default interactionCreateHandler;
