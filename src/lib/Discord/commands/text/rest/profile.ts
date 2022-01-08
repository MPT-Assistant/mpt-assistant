import utils from "../../../../utils";
import { MessageButton, MessageActionRow } from "discord.js";

import discordUtils from "../../../utils/";

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
							target: "user",
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
						label: `Подробнее о группе`,
						customId: JSON.stringify({ cmd: "group" }),
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
		];

		const embedProfile = discordUtils.profileToEmbed(interaction, {
			group,
			specialty,
		});

		return interaction.editReply({
			components: keyboard,
			embeds: [embedProfile],
		});
	},
});
