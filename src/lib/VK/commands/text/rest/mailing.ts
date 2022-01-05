import VKBotTextCommand from "../../../../utils/vk/TextCommand";

new VKBotTextCommand({
	alias: /^(?:изменения)(?:\s(включить|отключить))$/i,
	handler: (context) => {
		const isEnable = context.state.args[1].toLowerCase() === "включить";
		if (context.state.chat) {
			context.state.chat.inform = isEnable;
			return context.reply(
				`рассылка замен ${isEnable ? "включена" : "отключена"}.`,
			);
		} else {
			context.state.user.inform = isEnable;
			return context.reply(
				`рассылка замен ${isEnable ? "включена" : "отключена"}.`,
			);
		}
	},
});
