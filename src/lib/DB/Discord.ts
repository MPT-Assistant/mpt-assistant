import { typedModel } from "ts-mongoose";
import DB from "./DB";

import schemes from "./schemes/discord";

class Discord extends DB {
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
		channel: typedModel(
			"channel",
			schemes.channelSchema,
			"channels",
			undefined,
			undefined,
			this.connection,
		),
	};
}

export default Discord;
