import { MessageActionRow, MessageButton } from "discord.js";

import utils from "../../../../utils";
import DB from "../../../../DB";

import discordUtils from "../../../utils/";
import CallbackCommand from "../../../utils/CallbackCommand";

new CallbackCommand({
	trigger: "lessons",
	handler: async (interaction) => {
		if (utils.cache.mpt.isScheduleNotAvailable) {
			return await interaction.editReply({
				content: `Расписание будет доступно, когда оно появится на сайте`,
				embeds: [],
			});
		}
		const groupName =
			interaction.state.user.group ||
			(interaction.state.channel ? interaction.state.channel.group : "") ||
			(interaction.state.guild ? interaction.state.guild.group : "");

		const groupData = await DB.api.models.group.findOne({
			name: groupName,
		});

		if (!groupData) {
			return await interaction.editReply({
				content: "Такой группы не найдено, попробуйте снова установить группу",
				embeds: [],
			});
		}

		const selectedDate = utils.rest.parseSelectedDate(
			(interaction.payload.date as string) || undefined,
		);
		const keyboard = discordUtils.generateKeyboard("lessons");

		if (selectedDate.day() === 0) {
			return await interaction.editReply({
				content: `${selectedDate.format("DD.MM.YYYY")} воскресенье`,
				components: keyboard,
				embeds: [],
			});
		}

		const schedule = await utils.mpt.getGroupSchedule(groupData, selectedDate);

		if (schedule.lessons.length === 0) {
			return await interaction.editReply({
				content: `На ${selectedDate.format("DD.MM.YYYY")} пар у группы ${
					groupData.name
				} не найдено`,
				components: keyboard,
				embeds: [],
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
			content: "\u200b",
			components: keyboard,
			embeds: [discordUtils.scheduleToEmbed(schedule, selectedDate, groupData)],
		});
	},
});
