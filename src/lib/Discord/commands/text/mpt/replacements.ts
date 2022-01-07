import utils from "../../../../utils";
import DB from "../../../../DB";

import discordUtils from "../../../utils/";
import TextCommand from "../../../utils/TextCommand";

new TextCommand({
	name: "замены",
	description: "Позволяет просмотреть замены для своей группы",
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
		const keyboard = discordUtils.generateKeyboard("replacements");

		if (selectedDate.day() === 0) {
			return await interaction.editReply({
				content: `${selectedDate.format("DD.MM.YYYY")} воскресенье`,
				components: keyboard,
			});
		}

		const replacements = await utils.mpt.getGroupReplacements(
			groupData.name,
			selectedDate,
		);

		return await interaction.editReply({
			components: keyboard,
			embeds: [
				discordUtils.replacementsToEmbed(replacements, selectedDate, groupData),
			],
		});
	},
}).addStringOption((option) =>
	option.setName("дата").setDescription("Дата в формате DD.MM.YYYY"),
);
