import { InlineKeyboard } from "puregram";

import CallbackCommand from "../../../utils/CallbackCommand";

new CallbackCommand({
	event: "notify",
	handler: async (context) => {
		const status = Boolean(context.queryPayload.status);

		if (context.state.chat) {
			context.state.chat.inform = status;
			return await context.message?.editMessageText(
				`@${context.from?.username}, рассылка замен в чат ${
					status ? "включена" : "отключена"
				}`,
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
			context.state.user.inform = status;
			return await context.message?.editMessageText(
				`${context.from?.username}, рассылка замен ${
					status ? "включена" : "отключена"
				}`,
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
