import moment from "moment";

import EventCommand from "../../../../utils/vk/EventCommand";
import utils from "../../../../utils";

new EventCommand({
	event: "replacements",
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

		const replacements = await utils.mpt.getGroupReplacements(
			groupName,
			selectedDate,
		);

		if (replacements.list.length === 0) {
			return await event.answer({
				type: "show_snackbar",
				text: `На ${selectedDate.format(
					"DD.MM.YYYY",
				)} замен у группы ${groupName} не найдено`,
			});
		}

		await event.state.editParentMessage({
			message: replacements.toString(),
			keyboard: utils.vk.generateKeyboard("replacements"),
		});

		return;
	},
});
