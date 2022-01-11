import { MessageButton, MessageActionRow } from "discord.js";

import utils from "../../../../utils";
import TextCommand from "../../../utils/TextCommand";

new TextCommand({
	name: "уг",
	description: "Позволяет установить группу для себя",
	handler: async (interaction) => {
		const groupName = interaction.options.getString("группа", true);
		const target = interaction.options.getString("кому", true) as
			| "user"
			| "channel"
			| "guild";

		const group = await utils.mpt.findGroup(groupName);

		if (Array.isArray(group)) {
			const responseText = `\nВозможно вы имели в виду какую то из этих групп:
${group.map((name, index) => `${index + 1}. ${name}`).join("\n")}`;

			const keyboard: MessageActionRow[] = [];

			const styles = ["SUCCESS", "SECONDARY", "DANGER"] as const;

			for (let i = 0; i < 3; ++i) {
				keyboard.push(
					new MessageActionRow({
						components: [
							new MessageButton({
								label: group[i],
								customId: JSON.stringify({
									cmd: "setGroup",
									group: group[i],
									target,
								}),
								style: styles[i],
							}),
						],
					}),
				);
			}

			return await interaction.editReply({
				content: `группы ${groupName} не найдено, попробуйте ещё раз.${responseText}`,
				components: keyboard,
			});
		} else {
			const targetDocument = interaction.state[target];

			if (targetDocument) {
				targetDocument.group = group.name;
				if (target === "guild" || target === "channel") {
					return await interaction.editReply({
						content: `Вы установили группу для ${
							target === "guild" ? "сервера" : "канала"
						} по умолчанию ${group.name}\n${group.specialty}`,
					});
				}
			} else {
				interaction.state.user.group = group.name;
			}

			return await interaction.editReply({
				content: `Вы установили себе группу ${group.name}\n${group.specialty}`,
				components: [
					new MessageActionRow({
						components: [
							new MessageButton({
								label: `Профиль`,
								customId: JSON.stringify({ cmd: "profile" }),
								style: "SECONDARY",
							}),
						],
					}),
					new MessageActionRow({
						components: [
							new MessageButton({
								label: `Расписание`,
								customId: JSON.stringify({ cmd: "lessons" }),
								style: "SECONDARY",
							}),
						],
					}),
					new MessageActionRow({
						components: [
							new MessageButton({
								label: `Замены`,
								customId: JSON.stringify({ cmd: "replacements" }),
								style: "SECONDARY",
							}),
						],
					}),
				],
			});
		}
	},
})
	.addStringOption((option) =>
		option
			.setName("группа")
			.setDescription("Введите название вашей группы")
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName("кому")
			.setDescription("Для кого устанавливаем")
			.setRequired(true)
			.setChoices([
				["Себе", "user"],
				["Каналу", "channel"],
				["Серверу", "guild"],
			]),
	);
