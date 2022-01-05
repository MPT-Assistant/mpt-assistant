declare namespace BotVK {
	interface GroupMessageContextState {
		args: RegExpExecArray;
		user: ExtractDoc<typeof DB.bot.schemes.userSchema>;
		chat?: ExtractDoc<typeof DB.bot.schemes.chatSchema>;
	}
}
