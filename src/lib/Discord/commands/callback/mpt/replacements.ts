import utils from "../../../../utils";
import DB from "../../../../DB";

import discordUtils from "../../../utils/";
import CallbackCommand from "../../../utils/CallbackCommand";

new CallbackCommand({
	trigger: "replacements",
	handler: async (interaction) => {
		const groupName =
			interaction.state.user.group ||
			(interaction.state.channel ? interaction.state.channel.group : "") ||
			(interaction.state.guild ? interaction.state.guild.group : "");

		if (groupName === "") {
			return await interaction.editReply({
				content: `Группа не установлена, установить группу можно командой уг`,
				embeds: [],
			});
		}

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
		const keyboard = discordUtils.generateKeyboard("replacements");

		if (selectedDate.day() === 0) {
			return await interaction.editReply({
				content: `${selectedDate.format("DD.MM.YYYY")} воскресенье`,
				components: keyboard,
				embeds: [],
			});
		}

		const replacements = await utils.mpt.getGroupReplacements(
			groupData.name,
			selectedDate,
		);

		return await interaction.editReply({
			content: "\u200b",
			components: keyboard,
			embeds: [
				discordUtils.replacementsToEmbed(replacements, selectedDate, groupData),
			],
		});
	},
});
