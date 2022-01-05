import moment from "moment";

import EventCommand from "../../../../utils/vk/EventCommand";
import DB from "../../../../DB";
import utils from "../../../../utils";

new EventCommand({
	event: "lessons",
	handler: async (event) => {
		const selectedDate = moment(event.eventPayload.date, "DD.MM.YYYY");

		if (!selectedDate.isValid()) {
			return await event.answer({
				type: "show_snackbar",
				text: `Неверная дата ${event.eventPayload.date}`,
			});
		}

		if (selectedDate.day() === 0) {
			return await event.answer({
				type: "show_snackbar",
				text: `${selectedDate.format("DD.MM.YYYY")} воскресенье.`,
			});
		}

		const groupName =
			event.state.user.group ||
			(event.state.chat ? event.state.chat?.group : "");

		if (groupName === "") {
			return await event.answer({
				type: "show_snackbar",
				text: "Вы не установили свою группу.",
			});
		}

		const group = await DB.api.models.group.findOne({
			name: groupName,
		});

		if (!group) {
			return await event.answer({
				type: "show_snackbar",
				text: "Такой группы не найдено, попробуйте снова установить группу",
			});
		}

		const keyboard = utils.vk.generateKeyboard("lessons");
		const schedule = await utils.mpt.getGroupSchedule(group, selectedDate);

		await event.state.editParentMessage({
			message: schedule.toString(),
			keyboard,
		});

		return;
	},
});
