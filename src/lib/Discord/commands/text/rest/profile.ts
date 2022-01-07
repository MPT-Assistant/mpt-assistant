import utils from "../../../../utils";
import { MessageButton, MessageActionRow, MessageEmbed } from "discord.js";

import TextCommand from "../../../utils/TextCommand";

new TextCommand({
	name: "профиль",
	description: "Ваш профиль",
	isPrivate: true,
	handler: async (interaction) => {
		if (!interaction.state.user.group) {
			return interaction.editReply({
				content: `Ваш профиль:
ID: ${interaction.user.id}
Группа: Не установлена`,
			});
		}

		const { group, specialty } = await utils.mpt.getExtendGroupInfo(
			interaction.state.user.group,
		);

		const groupLeaders = specialty.groupsLeaders.find(
			(x) => x.name === group.name,
		);

		const keyboard = [
			new MessageActionRow({
				components: [
					new MessageButton({
						label: `${
							interaction.state.user.inform ? "Отключить" : "Включить"
						} уведомления`,
						customId: JSON.stringify({
							cmd: "notify",
							status: !interaction.state.user.inform,
						}),
						style: interaction.state.user.inform ? "DANGER" : "SUCCESS",
					}),
				],
			}),
			new MessageActionRow({
				components: [
					new MessageButton({
						label: `Сайт отделения`,
						style: "LINK",
						url: specialty.url,
					}),
				],
			}),
			new MessageActionRow({
				components: [
					new MessageButton({
						label: `Расписание`,
						customId: JSON.stringify({ cmd: "schedule" }),
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
		];

		const embedProfile = new MessageEmbed();
		embedProfile.setAuthor({
			name: interaction.user.username,
			iconURL: interaction.user.avatarURL() || undefined,
		});
		embedProfile.setTitle(
			`Группа: ${interaction.state.user.group}
Отделение: ${specialty.name}`,
		);
		if (groupLeaders) {
			embedProfile.setDescription("Актив группы:");
			embedProfile.addFields(
				...groupLeaders.roles.map((x) => {
					return {
						name: x.role,
						value: x.name,
						inline: true,
					};
				}),
			);
		}
		embedProfile.setFooter({ text: "Дата регистрации" });
		embedProfile.setTimestamp(interaction.state.user.regDate);

		return interaction.editReply({
			content: `Ваш профиль:
Информирование о заменах: ${
				interaction.state.user.inform ? "Включено" : "Отключено"
			}`,
			components: keyboard,
			embeds: [embedProfile],
		});
	},
});
