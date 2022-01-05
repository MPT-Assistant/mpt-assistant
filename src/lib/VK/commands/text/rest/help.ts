import VKBotTextCommand from "../../../../utils/vk/TextCommand";

new VKBotTextCommand({
	alias: ["помощь", "help", "start", "команды"],
	handler: (context) => {
		return context.reply(
			`${
				!context.isChat
					? "Для использования полного функционала бота рекомендуется добавить его в беседу.\n"
					: ""
			}Список команд:`,
			{ attachment: `article-188434642_189203_12d88f37969ae1c641` },
		);
	},
});
