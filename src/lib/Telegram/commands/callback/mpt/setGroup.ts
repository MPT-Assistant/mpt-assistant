import { InlineKeyboard } from "puregram";

import DB from "../../../../DB";

import CallbackCommand from "../../../utils/CallbackCommand";

new CallbackCommand({
	event: "setGroup",
	handler: async (context) => {
		const selectedGroup = await DB.api.models.group.findOne({
			name: new RegExp(`^${context.queryPayload.group}$`, "i"),
		});

		if (!selectedGroup) {
			return await context.answerCallbackQuery({
				show_alert: true,
				text: `Группы ${context.queryPayload.group} не найдено`,
			});
		} else {
			context.state.user.group = selectedGroup.name;

			await context.answerCallbackQuery({
				show_alert: true,
				text: `Вы установили себе группу ${selectedGroup.name}.\n(${selectedGroup.specialty})`,
			});

			return await context.message?.editMessageText(
				`${context.from?.username}, Вы установили себе группу ${selectedGroup.name}\nОтделение: ${selectedGroup.specialty}`,
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
