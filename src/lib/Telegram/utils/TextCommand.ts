import telegramUtils from ".";
import BotTelegram from "./types";

class TelegramBotTextCommand {
	public readonly regexp: RegExp;
	public readonly templates: string[];
	public readonly handler: (
		context: BotTelegram.ModernMessageContext,
	) => Promise<unknown>;

	constructor({
		alias,
		templates = [],
		handler,
	}: {
		alias: RegExp | string | string[];
		templates?: string[];
		handler: (context: BotTelegram.ModernMessageContext) => Promise<unknown>;
	}) {
		if (typeof alias === "string") {
			alias = new RegExp(`^(?:${alias})$`, "i");
		}
		if (Array.isArray(alias)) {
			alias = new RegExp(`^(?:${alias.join("|")})$`, "i");
		}
		this.regexp = alias;
		this.templates = templates;
		this.handler = handler;

		telegramUtils.textCommands.push(this);
	}

	public check(input: string): boolean {
		return this.regexp.test(input);
	}
}

export default TelegramBotTextCommand;
