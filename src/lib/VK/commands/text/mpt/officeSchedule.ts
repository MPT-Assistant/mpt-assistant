import moment from "moment";

import utils from "../../../../utils";
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
				`на ${date.format(
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
			const addZero = (num: number): string => {
				if (num < 10) {
					return "0" + num.toString();
				} else {
					return num.toString();
				}
			};
			const timetable = utils.mpt.getTimetable(new Date());
			const response = `Сейчас ${
				timetable.current.type === "lesson" ? "пара" : "перемена"
			}, до её конца осталось ${addZero(
				timetable.current.diffEnd.hours,
			)}:${addZero(timetable.current.diffEnd.minutes)}:${addZero(
				timetable.current.diffEnd.seconds,
			)}
До начала ${timetable.next.num} ${
				timetable.next.type === "lesson" ? "пары" : "перемены"
			} осталось ${addZero(timetable.next.diffEnd.hours)}:${addZero(
				timetable.next.diffEnd.minutes,
			)}:${addZero(timetable.next.diffEnd.seconds)}`;

			return await context.reply(
				`кабинеты на сегодня установленные пользователем @id${context.state.chat.officeSchedule.user}
${response}`,
				{
					attachment: context.state.chat.officeSchedule.image,
				},
			);
		}
	},
});
