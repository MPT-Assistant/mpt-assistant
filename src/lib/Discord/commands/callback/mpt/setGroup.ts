import { MessageActionRow, MessageButton } from "discord.js";
import utils from "../../../../utils";
import CallbackCommand from "../../../utils/CallbackCommand";

new CallbackCommand({
	trigger: "setGroup",
	handler: async (interaction) => {
		const { group: groupName, target } = interaction.payload;

		if (typeof groupName !== "string" || typeof target !== "string") {
			return;
		}

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
				embeds: [],
			});
		} else {
			const targetDocument =
				interaction.state[target as "user" | "guild" | "channel"];

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
				embeds: [],
			});
		}
	},
});
