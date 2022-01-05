import VKBotTextCommand from "../../../utils/TextCommand";

new VKBotTextCommand({
	alias: /^(?:ник)(?:\s(.*))$/i,
	handler: (context) => {
		if (context.state.args[1].length > 25) {
			return context.reply(`максимальная длина ника 25 символов.`);
		}
		context.state.user.nickname = context.state.args[1];
		return context.reply(`Вы успешно сменили ник.`);
	},
});
