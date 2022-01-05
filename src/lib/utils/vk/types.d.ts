import { ExtractDoc } from "ts-mongoose";
import DB from "../../DB";

namespace BotVK {
	interface GroupMessageContextState {
		args: RegExpExecArray;
		user: ExtractDoc<typeof DB.vk.schemes.userSchema>;
		chat?: ExtractDoc<typeof DB.vk.schemes.chatSchema>;
	}
}

export default BotVK;
