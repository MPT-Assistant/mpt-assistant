import telegramUtils from "../utils";

import BotTelegram from "../utils/types";

export default async function messageNewHandler(
	context: BotTelegram.ModernMessageContext,
): Promise<void> {
	const reply = context.reply.bind(context);
	context.reply = (text, params) => {
		text = `${context.from?.username}, ${text}`;
		return reply(text, params);
	};

	if (!context.text || !context.from || context.from.isBot) {
		if (context.isPM) {
			await context.reply(
				"такой команды не существует\nСписок команд: https://vk.com/@mpt_assistant-helps",
			);
		}
		return;
	}

	const command = telegramUtils.textCommands.find((x) =>
		x.check(context.text as string),
	);

	if (command) {
		context.state = {
			args: command.regexp.exec(context.text as string) as RegExpExecArray,
			user: await telegramUtils.getUserData(context.from.id),
			chat:
				!context.isPM && context.chatId
					? await telegramUtils.getChatData(context.chatId)
					: undefined,
		};

		await command.handler(context);
		await context.state.user.save();
		if (context.state.chat) {
			await context.state.chat.save();
		}
	} else if (context.isPM) {
		await context.reply(
			"такой команды не существует\nСписок команд: https://vk.com/@mpt_assistant-helps",
		);
	}
}
