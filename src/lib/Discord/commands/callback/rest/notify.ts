import CallbackCommand from "../../../utils/CallbackCommand";
import { MessageActionRow, MessageButton } from "discord.js";

new CallbackCommand({
	trigger: "notify",
	handler: async (interaction) => {
		const status = Boolean(interaction.payload.status);
		const target = interaction.payload.target as "user" | "channel";

		if (target === "channel" && interaction.state.channel) {
			interaction.state.channel.inform = status;
			return interaction.editReply({
				content: `Рассылка замен в канале ${status ? "включена" : "отключена"}`,
				embeds: [],
			});
		} else if (target === "user") {
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
		} else {
			return interaction.editReply({
				embeds: [],
				content: `Доступно только в каналах, перейдите в канал и вызовите команду там`,
			});
		}
	},
});
