import utils from "../../../../utils";
import { MessageButton, MessageActionRow } from "discord.js";

import TextCommand from "../../../utils/TextCommand";

new TextCommand({
	name: "канал",
	description: "Информация о канале",
	handler: async (interaction) => {
		if (!interaction.state.channel) {
			return await interaction.reply(`Доступно только в каналах`);
		}

		if (!interaction.state.channel.group) {
			return interaction.reply({
				content: `канал #${interaction.state.channel.id}
Группа: Не установлена`,
				components: [
					new MessageActionRow({
						components: [
							new MessageButton({
								label: `Установить группу для канала`,
								customId: JSON.stringify({ cmd: "regChannel" }),
								style: "SUCCESS",
							}),
						],
					}),
				],
			});
		}

		const { group, specialty } = await utils.mpt.getExtendGroupInfo(
			interaction.state.channel.group,
		);

		const groupLeaders = specialty.groupsLeaders.find(
			(x) => x.name === group.name,
		);

		const keyboard = [
			new MessageActionRow({
				components: [
					new MessageButton({
						label: `${
							interaction.state.channel.inform ? "Отключить" : "Включить"
						} уведомления`,
						customId: JSON.stringify({
							cmd: "notify",
							status: !interaction.state.channel.inform,
						}),
						style: interaction.state.channel.inform ? "DANGER" : "SUCCESS",
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

		return interaction.reply({
			content: `канал #${interaction.state.channel.id}
Группа: ${interaction.state.user.group}
Отделение: ${specialty.name}
		${
			groupLeaders
				? `\nАктив группы:\n` +
				  groupLeaders.roles
						.map((item, index) => `${index + 1}. ${item.role} - ${item.name}`)
						.join("\n")
				: ""
		}

Информирование о заменах: ${
				interaction.state.channel.inform ? "Включено" : "Отключено"
			}`,
			components: keyboard,
		});
	},
});
