import discordUtils from "./index";
import BotDiscord from "./types";

class CallbackCommand {
	public readonly handler: BotDiscord.CallbackCommand.TCommandHandler;
	public readonly trigger: string;

	constructor({ handler, trigger }: BotDiscord.CallbackCommand.ICommandParams) {
		this.trigger = trigger;
		this.handler = handler;
		discordUtils.callbackCommands.push(this);
	}
}

export default CallbackCommand;
