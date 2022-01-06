import { InlineKeyboard } from "puregram";
import TextCommand from "../../../utils/TextCommand";

new TextCommand({
	alias: /^(?:изменения)(?:\s(включить|отключить))$/i,
	handler: (context) => {
		const isEnable = context.state.args[1].toLowerCase() === "включить";
		if (context.state.chat) {
			context.state.chat.inform = isEnable;
			return context.reply(
				`рассылка замен ${isEnable ? "включена" : "отключена"}.`,
				{
					reply_markup: InlineKeyboard.keyboard([
						InlineKeyboard.textButton({
							text: "Чат",
							payload: {
								cmd: "chat",
							},
						}),
					]),
				},
			);
		} else {
			context.state.user.inform = isEnable;
			return context.reply(
				`рассылка замен ${isEnable ? "включена" : "отключена"}.`,
				{
					reply_markup: InlineKeyboard.keyboard([
						InlineKeyboard.textButton({
							text: "Профиль",
							payload: {
								cmd: "profile",
							},
						}),
					]),
				},
			);
		}
	},
});
