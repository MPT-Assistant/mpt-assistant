import moment from "moment";

import VKBotTextCommand from "../../../utils/TextCommand";

new VKBotTextCommand({
	alias: /^(?:кабинеты)$/i,
	handler: async (context) => {
		if (context.isDM || !context.state.chat) {
			return;
		}

		if (context.hasAttachments("photo")) {
			const date = moment();
			const imageAttachment = context.getAttachments("photo")[0].toString();
			context.state.chat.officeSchedule = {
				date: date.toDate(),
				image: context.getAttachments("photo")[0].toString(),
				user: context.senderId,
			};

			return await context.reply(
				`На ${date.format(
					"DD.MM.YYYY",
				)} установлено расписание кабинетов\nПросмотреть кабинеты в течении этого дня можно командой: кабинеты`,
				{
					attachment: imageAttachment,
				},
			);
		}

		if (!context.state.chat.officeSchedule) {
			return;
		}

		if (
			moment(context.state.chat.officeSchedule.date).isSame(new Date(), "day")
		) {
			return await context.reply(
				`Кабинеты на сегодня установленные пользователем @id${context.state.chat.officeSchedule.user}`,
				{
					attachment: context.state.chat.officeSchedule.image,
				},
			);
		}
	},
});
