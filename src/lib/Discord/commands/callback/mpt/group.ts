import discordUtils from "../../../utils/";

import utils from "../../../../utils";
import CallbackCommand from "../../../utils/CallbackCommand";

new CallbackCommand({
	trigger: "group",
	handler: async (interaction) => {
		const groupName =
			interaction.state.user.group ||
			(interaction.state.channel ? interaction.state.channel.group : "") ||
			(interaction.state.guild ? interaction.state.guild.group : "");

		if (!groupName) {
			return await interaction.editReply(
				`Группа не установлена, установить группу можно командой уг`,
			);
		}

		const groupData = await utils.mpt.getExtendGroupInfo(
			interaction.state.user.group,
		);

		return await interaction.editReply({
			content: "\u200b",
			embeds: discordUtils.groupToEmbed(groupData),
			components: [],
		});
	},
});
