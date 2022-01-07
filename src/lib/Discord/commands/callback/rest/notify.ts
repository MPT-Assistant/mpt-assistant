import CallbackCommand from "../../../utils/CallbackCommand";
import { MessageActionRow, MessageButton } from "discord.js";

new CallbackCommand({
	trigger: "notify",
	handler: async (interaction) => {
		const status = Boolean(interaction.payload.status);
		if (interaction.state.channel) {
			interaction.state.channel.inform = status;
			return interaction.editReply({
				content: `Рассылка замен в канале ${status ? "включена" : "отключена"}`,
				embeds: [],
			});
		} else {
			interaction.state.user.inform = status;
			return interaction.editReply({
				embeds: [],
				content: `Рассылка замен ${status ? "включена" : "отключена"}`,
				components: [
					new MessageActionRow({
						components: [
							new MessageButton({
								label: "Профиль",
								customId: JSON.stringify({ cmd: "profile" }),
								style: "SECONDARY",
							}),
						],
					}),
				],
			});
		}
	},
});
