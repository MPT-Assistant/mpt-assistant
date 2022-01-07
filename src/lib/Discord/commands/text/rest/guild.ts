import utils from "../../../../utils";
import { MessageButton, MessageActionRow } from "discord.js";

import TextCommand from "../../../utils/TextCommand";

new TextCommand({
	name: "сервер",
	description: "Информация о сервере",
	handler: async (interaction) => {
		if (!interaction.state.guild) {
			return await interaction.editReply(`Доступно только на сервере`);
		}

		if (!interaction.state.guild.group) {
			return interaction.editReply({
				content: `сервер #${interaction.state.guild.id}
Группа: Не установлена`,
			});
		}

		const { group, specialty } = await utils.mpt.getExtendGroupInfo(
			interaction.state.guild.group,
		);

		const groupLeaders = specialty.groupsLeaders.find(
			(x) => x.name === group.name,
		);

		const keyboard = [
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

		return interaction.editReply({
			content: `сервер #${interaction.state.guild.id}
Группа: ${interaction.state.user.group}
Отделение: ${specialty.name}
		${
			groupLeaders
				? `\nАктив группы:\n` +
				  groupLeaders.roles
						.map((item, index) => `${index + 1}. ${item.role} - ${item.name}`)
						.join("\n")
				: ""
		}`,
			components: keyboard,
		});
	},
});
