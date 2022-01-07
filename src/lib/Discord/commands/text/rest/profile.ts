import utils from "../../../../utils";
import { MessageButton, MessageActionRow } from "discord.js";

import TextCommand from "../../../utils/TextCommand";

new TextCommand({
	name: "профиль",
	description: "Ваш профиль",
	handler: async (interaction) => {
		if (!interaction.state.user.group) {
			return interaction.reply({
				content: `Ваш профиль:
ID: ${interaction.user.id}
Группа: Не установлена`,
				components: [
					new MessageActionRow({
						components: [
							new MessageButton({
								label: `Установить группу`,
								customId: JSON.stringify({ cmd: "replacements" }),
								style: "SUCCESS",
							}),
						],
					}),
				],
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
						customId: JSON.stringify({ cmd: "profile" }),
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

		return interaction.reply({
			content: `Ваш профиль:
ID: ${interaction.user.id}
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
				interaction.state.user.inform ? "Включено" : "Отключено"
			}`,
			components: keyboard,
		});
	},
});
