import telegramUtils from "../utils";
import BotTelegram from "../utils/types";

export default async function callbackQueryHandler(
	context: BotTelegram.ModernCallbackQueryContext,
): Promise<void> {
	if (!context.from || context.from.isBot() || !context.queryPayload.cmd) {
		return;
	}

	const command = telegramUtils.callbackCommands.find(
		(x) => x.event === (context.queryPayload.cmd as string),
	);

	if (command) {
		context.state = {
			user: await telegramUtils.getUserData(context.from.id),
			chat:
				!context.message?.isPM && context.message?.chatId
					? await telegramUtils.getChatData(context.message?.chatId)
					: undefined,
		};

		await command.handler(context);
		await context.answerCallbackQuery();
		await context.state.user.save();
		if (context.state.chat) {
			await context.state.chat.save();
		}
	}
}
