import moment from "moment";
import DB from "../../../../DB";

import VKBotTextCommand from "../../../utils/TextCommand";

new VKBotTextCommand({
	alias: "stats",
	handler: async (context) => {
		const [
			vkUsers,
			vkChats,
			tgUsers,
			tgChats,
			discordUsers,
			discordChannels,
			discordGuilds,
			groups,
			specialties,
			replacements,
		] = await Promise.all([
			DB.vk.models.user.countDocuments(),
			DB.vk.models.chat.countDocuments(),
			DB.telegram.models.user.countDocuments(),
			DB.telegram.models.chat.countDocuments(),
			DB.discord.models.user.countDocuments(),
			DB.discord.models.channel.countDocuments(),
			DB.discord.models.guild.countDocuments(),
			DB.api.models.group.countDocuments(),
			DB.api.models.specialty.countDocuments(),
			DB.api.models.replacement.countDocuments(),
		]);

		return await context.reply(`stats:
VK users: ${vkUsers}
VK chats: ${vkChats}

Telegram users: ${tgUsers}
Telegram chats: ${tgChats}

Discord users: ${discordUsers}
Discord channels: ${discordChannels}
Discord guilds: ${discordGuilds}

Groups: ${groups}
Specialties: ${specialties}
Replacements: ${replacements}

Launched: ${moment()
			.subtract(process.uptime(), "seconds")
			.format(" HH:mm:ss, DD.MM.YYYY")}`);
	},
});
