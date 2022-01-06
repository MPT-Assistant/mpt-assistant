import { ExtractDoc } from "ts-mongoose";
import DB from "../../DB";

import TextCommand from "./TextCommand";
import CallbackCommand from "./CallbackCommand";

class UtilsTelegram {
	public textCommands: TextCommand[] = [];
	public callbackCommands: CallbackCommand[] = [];

	public async getUserData(
		id: number,
	): Promise<ExtractDoc<typeof DB.telegram.schemes.userSchema>> {
		let data = await DB.telegram.models.user.findOne({
			id,
		});
		if (!data) {
			data = new DB.telegram.models.user({
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
		id: number,
	): Promise<ExtractDoc<typeof DB.telegram.schemes.chatSchema>> {
		let data = await DB.telegram.models.chat.findOne({
			id,
		});
		if (!data) {
			data = new DB.telegram.models.chat({
				id,
				group: "",
				inform: true,
				reportedReplacements: [],
			});
			await data.save();
		}
		return data;
	}
}

export default new UtilsTelegram();
