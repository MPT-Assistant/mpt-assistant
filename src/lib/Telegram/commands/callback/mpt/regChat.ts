import DB from "../../../../DB";

import CallbackCommand from "../../../utils/CallbackCommand";

new CallbackCommand({
	event: "regChat",
	handler: async (context) => {
		if (!context.state.chat) {
			return;
		}

		const selectedGroup = await DB.api.models.group.findOne({
			name: new RegExp(`^${context.queryPayload.group}$`, "i"),
		});

		if (!selectedGroup) {
			return await context.answerCallbackQuery({
				show_alert: true,
				text: `Группы ${context.queryPayload.group} не найдено`,
			});
		} else {
			context.state.chat.group = selectedGroup.name;

			await context.answerCallbackQuery({
				show_alert: true,
				text: `Вы установили чату группу ${selectedGroup.name}.\n(${selectedGroup.specialty})`,
			});

			return await context.message?.editMessageText(
				`@${context.from?.username}, установил группу для чата по умолчанию\nГруппа: ${selectedGroup.name}\nОтделение: ${selectedGroup.specialty}`,
			);
		}
	},
});
