import Command from "./Command";

import { ExtractDoc } from "ts-mongoose";

import DB from "../../DB";

class UtilsDiscord {
	public readonly commandsList: Command[] = [];

	public async getUserData(
		id: string,
	): Promise<ExtractDoc<typeof DB.discord.schemes.userSchema>> {
		let data = await DB.discord.models.user.findOne({
			id,
		});
		if (!data) {
			data = new DB.discord.models.user({
				id,
				ban: false,
				group: "",
				inform: true,
				reportedReplacements: [],
				regDate: new Date(),
			});
			await data.save();
		}
		return data;
	}

	public async getChatData(
		id: string,
	): Promise<ExtractDoc<typeof DB.discord.schemes.channelSchema>> {
		let data = await DB.discord.models.channel.findOne({
			id,
		});
		if (!data) {
			data = new DB.discord.models.channel({
				id,
				group: "",
				inform: true,
				reportedReplacements: [],
			});
			await data.save();
		}
		return data;
	}

	public async getGuildData(
		id: string,
	): Promise<ExtractDoc<typeof DB.discord.schemes.guildSchema>> {
		let data = await DB.discord.models.guild.findOne({
			id,
		});
		if (!data) {
			data = new DB.discord.models.guild({
				id,
				group: "",
			});
			await data.save();
		}
		return data;
	}
}

export default new UtilsDiscord();
