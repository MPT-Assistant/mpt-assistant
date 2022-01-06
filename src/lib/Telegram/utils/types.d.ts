/* eslint-disable @typescript-eslint/no-unused-vars */

import { MessageContext } from "puregram";
import { ExtractDoc } from "ts-mongoose";
import DB from "../../DB";

namespace BotTelegram {
	interface ModernMessageContext extends MessageContext {
		state: {
			args: RegExpExecArray;
			user: ExtractDoc<typeof DB.telegram.schemes.userSchema>;
			chat?: ExtractDoc<typeof DB.telegram.schemes.chatSchema>;
		};
	}
}

export default BotTelegram;
