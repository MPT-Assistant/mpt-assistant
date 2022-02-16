import { MessageButton, MessageActionRow } from "discord.js";

import utils from "../../../../utils";
import DB from "../../../../DB";

import discordUtils from "../../../utils/";
import TextCommand from "../../../utils/TextCommand";

new TextCommand({
	name: "расписание",
	description: "Позволяет просмотреть расписание для своей группы",
	handler: async (interaction) => {
		const groupName =
			interaction.state.user.group ||
			(interaction.state.channel ? interaction.state.channel.group : "") ||
			(interaction.state.guild ? interaction.state.guild.group : "");

		if (groupName === "") {
			return await interaction.editReply(
				`Группа не установлена, установить группу можно командой уг`,
			);
		}

		const groupData = await DB.api.models.group.findOne({
			name: groupName,
		});

		if (!groupData) {
			return await interaction.editReply(
				"Такой группы не найдено, попробуйте снова установить группу",
			);
		}

		const date = interaction.options.getString("дата");

		const selectedDate = utils.rest.parseSelectedDate(date || undefined);
		const keyboard = discordUtils.generateKeyboard("lessons");

		if (selectedDate.day() === 0) {
			return await interaction.editReply({
				content: `${selectedDate.format("DD.MM.YYYY")} воскресенье`,
				components: keyboard,
			});
		}

		const schedule = await utils.mpt.getGroupSchedule(groupData, selectedDate);

		if (schedule.lessons.length === 0) {
			return await interaction.editReply({
				content: `На ${selectedDate.format("DD.MM.YYYY")} пар у группы ${
					groupData.name
				} не найдено`,
				components: keyboard,
			});
		}

		if (schedule.replacements.length !== 0) {
			keyboard.push(
				new MessageActionRow({
					components: [
						new MessageButton({
							label: "Замены",
							customId: JSON.stringify({
								cmd: "replacements",
								date: selectedDate.format("DD.MM.YYYY"),
								notDuplicate: 3,
							}),
							style: "SECONDARY",
						}),
					],
				}),
			);
		}

		return await interaction.editReply({
			components: keyboard,
			embeds: [discordUtils.scheduleToEmbed(schedule, selectedDate, groupData)],
		});
	},
}).addStringOption((option) =>
	option.setName("дата").setDescription("Дата в формате DD.MM.YYYY"),
);
