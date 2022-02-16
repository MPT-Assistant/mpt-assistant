import moment from "moment";
import { Keyboard } from "vk-io";

import EventCommand from "../../../utils/EventCommand";
import DB from "../../../../DB";

import utils from "../../../../utils";
import vkUtils from "../../../utils";

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

		const keyboard = vkUtils.generateKeyboard("lessons");
		const schedule = await utils.mpt.getGroupSchedule(group, selectedDate);

		if (schedule.lessons.length === 0) {
			return await event.state.editParentMessage({
				message: `на ${selectedDate.format(
					"DD.MM.YYYY",
				)} пар у группы ${groupName} не найдено`,
				keyboard,
			});
		}

		if (schedule.replacements.length !== 0) {
			keyboard.row();
			keyboard.callbackButton({
				label: "Замены",
				payload: {
					cmd: "replacements",
					date: selectedDate.format("DD.MM.YYYY"),
				},
				color: Keyboard.PRIMARY_COLOR,
			});
		}

		await event.state.editParentMessage({
			message: schedule.toString(),
			keyboard,
		});

		return;
	},
});
