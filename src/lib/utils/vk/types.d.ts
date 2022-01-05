import { ExtractDoc } from "ts-mongoose";
import { MessageEditParams } from "vk-io";
import { BaseBoolInt } from "vk-io/lib/api/schemas/objects";
import DB from "../../DB";

namespace BotVK {
	interface GroupMessageContextState {
		args: RegExpExecArray;
		user: ExtractDoc<typeof DB.vk.schemes.userSchema>;
		chat?: ExtractDoc<typeof DB.vk.schemes.chatSchema>;
	}

	interface GroupEventContextState {
		user: ExtractDoc<typeof DB.bot.schemes.userSchema>;
		chat?: ExtractDoc<typeof DB.bot.schemes.chatSchema>;
		editParentMessage(params: MessageEditParams): Promise<unknown>;
	}
}

export default BotVK;
