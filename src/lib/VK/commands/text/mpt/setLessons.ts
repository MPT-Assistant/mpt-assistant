import VKBotTextCommand from "../../../utils/TextCommand";

new VKBotTextCommand({
	alias: /^(?:set lessons)$/i,
	handler: async (context) => {
		if (!context.hasAttachments("photo")) {
			return context.reply(`Прикрепите фотографию с расписанием`);
		}

		const image = context.getAttachments("photo")[0].toString();

		if (context.state.chat) {
			context.state.chat.schedule = {
				user: context.senderId,
				date: new Date(),
				image,
			};

			return await context.reply(
				`в качестве временного расписания установлена фотография:`,
				{
					attachment: image,
				},
			);
		} else {
			context.state.user.schedule = {
				date: new Date(),
				image,
			};
			return await context.reply(
				`в качестве временного расписания установлена фотография:`,
				{
					attachment: image,
				},
			);
		}
	},
});
