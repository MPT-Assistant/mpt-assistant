/* eslint-disable @typescript-eslint/no-unused-vars */

import { ExtractDoc } from "ts-mongoose";
import { Params } from "vk-io";
import DB from "../../DB";

namespace BotVK {
	interface GroupMessageContextState {
		args: RegExpExecArray;
		user: ExtractDoc<typeof DB.vk.schemes.userSchema>;
		chat?: ExtractDoc<typeof DB.vk.schemes.chatSchema>;
	}

	interface GroupEventContextState {
		user: ExtractDoc<typeof DB.vk.schemes.userSchema>;
		chat?: ExtractDoc<typeof DB.vk.schemes.chatSchema>;
		editParentMessage(
			params: Partial<Params.MessagesEditParams>,
		): Promise<unknown>;
	}
}

export default BotVK;
