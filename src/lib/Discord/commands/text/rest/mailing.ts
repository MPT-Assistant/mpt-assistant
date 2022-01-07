import { MessageActionRow, MessageButton } from "discord.js";
import TextCommand from "../../../utils/TextCommand";

new TextCommand({
	name: "рассылка",
	description:
		"Позволяет включить или отключить рассылку замен в канал или профиль",
	handler: (interaction) => {
		const isEnable = interaction.options.getBoolean("статус", true);
		const target = interaction.options.getString("кому", true) as
			| "user"
			| "channel";

		if (target === "channel" && interaction.state.channel) {
			interaction.state.channel.inform = isEnable;
			return interaction.editReply({
				content: `Рассылка замен в канале ${
					isEnable ? "включена" : "отключена"
				}`,
			});
		} else if (target === "user") {
			interaction.state.user.inform = isEnable;
			return interaction.editReply({
				content: `Рассылка замен ${isEnable ? "включена" : "отключена"}`,
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
				content: `Доступно только в каналах, перейдите в канал и вызовите команду там`,
			});
		}
	},
})
	.addBooleanOption((option) =>
		option
			.setName("статус")
			.setDescription("Выберите включена рассылка, либо нет")
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName("кому")
			.setDescription("Для кого")
			.setRequired(true)
			.setChoices([
				["Себе", "user"],
				["Каналу", "channel"],
			]),
	);
