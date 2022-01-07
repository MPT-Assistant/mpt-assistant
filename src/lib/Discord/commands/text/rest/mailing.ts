import { MessageActionRow, MessageButton } from "discord.js";
import TextCommand from "../../../utils/TextCommand";

new TextCommand({
	name: "рассылка",
	description:
		"Позволяет включить или отключить рассылку замен в канал или профиль",
	handler: (interaction) => {
		const isEnable = interaction.options.getBoolean("статус", true);
		if (interaction.state.channel) {
			interaction.state.channel.inform = isEnable;
			return interaction.editReply({
				content: `Рассылка замен в канале ${
					isEnable ? "включена" : "отключена"
				}`,
			});
		} else {
			interaction.state.user.inform = isEnable;
			return interaction.editReply({
				content: `Рассылка замен ${isEnable ? "включена" : "отключена"}`,
				components: [
					new MessageActionRow({
						components: [
							new MessageButton({
								label: "Профиль",
								customId: "profile",
								style: "SECONDARY",
							}),
						],
					}),
				],
			});
		}
	},
}).addBooleanOption((option) =>
	option
		.setName("статус")
		.setDescription("Выберите включена рассылка, либо нет")
		.setRequired(true),
);
