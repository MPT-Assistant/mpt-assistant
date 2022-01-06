import BotTelegram from "./types";
import telegramUtils from ".";

class TelegramCallbackCommand {
	public readonly event: string;
	public readonly handler: (
		event: BotTelegram.ModernCallbackQueryContext,
	) => Promise<unknown>;

	constructor({
		event,
		handler,
	}: {
		event: string;
		handler: (
			event: BotTelegram.ModernCallbackQueryContext,
		) => Promise<unknown>;
	}) {
		this.event = event;
		this.handler = handler;
		telegramUtils.callbackCommands.push(this);
	}
}

export default TelegramCallbackCommand;
