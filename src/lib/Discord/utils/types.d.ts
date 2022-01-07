import { ButtonInteraction, CommandInteraction } from "discord.js";
import { ExtractDoc } from "ts-mongoose";

import DB from "../../DB";

declare namespace BotDiscord {
	interface IStateInfo {
		user: ExtractDoc<typeof DB.discord.schemes.userSchema>;
		channel?: ExtractDoc<typeof DB.discord.schemes.channelSchema>;
		guild?: ExtractDoc<typeof DB.discord.schemes.guildSchema>;
	}

	namespace TextCommand {
		type Context = CommandInteraction & { state: IStateInfo };

		type TCommandHandler = (interaction: Context) => unknown;

		interface ICommandParams {
			name: string;
			description: string;
			handler: TCommandHandler;
			isPrivate?: boolean;
		}
	}

	namespace CallbackCommand {
		type Payload = Record<string, unknown>;
		type Context = ButtonInteraction & { state: IStateInfo; payload: Payload };

		type TCommandHandler = (interaction: Context) => unknown;

		interface ICommandParams {
			trigger: string;
			handler: TCommandHandler;
		}
	}
}

export default BotDiscord;
