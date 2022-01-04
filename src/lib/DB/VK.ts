import { typedModel } from "ts-mongoose";
import DB from "./DB";

import schemes from "./schemes/vk";

class VK extends DB {
	public readonly schemes = schemes;
	public readonly models = {
		user: typedModel(
			"user",
			schemes.userSchema,
			"users",
			undefined,
			undefined,
			this.connection,
		),
		chat: typedModel(
			"chat",
			schemes.chatSchema,
			"chats",
			undefined,
			undefined,
			this.connection,
		),
	};
}

export default VK;
