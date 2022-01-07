import { CommandInteraction } from "discord.js";
import { ExtractDoc } from "ts-mongoose";

import DB from "../../DB";

declare namespace BotDiscord {
	interface IStateInfo {
		user: ExtractDoc<typeof DB.discord.schemes.userSchema>;
		channel?: ExtractDoc<typeof DB.discord.schemes.channelSchema>;
		guild?: ExtractDoc<typeof DB.discord.schemes.guildSchema>;
	}

	type TCommandHandler = (
		interaction: CommandInteraction & { state: IStateInfo },
	) => unknown;

	interface ICommandParams {
		name: string;
		description: string;
		handler: TCommandHandler;
	}
}

export default BotDiscord;
