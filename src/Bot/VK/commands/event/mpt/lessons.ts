import moment from "moment";
import { Keyboard, MessageEventContext } from "vk-io";
import DB from "../../../../../lib/DB";
import utils from "../../../../../lib/utils";
import EventCommand from "../../../EventCommand";

const isPayloadObject = (
    payload: MessageEventContext["eventPayload"]
): payload is { date: string; cmd: "lessons" } => {
    return typeof payload === "object";
};

new EventCommand({
    trigger: "lessons",
    func: async (event, { utils: vkUtils }): Promise<unknown> => {
        if (!isPayloadObject(event.eventPayload)) {
            return;
        }

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
			event.state.chat?.group;

        if (!groupName || groupName === "") {
            return await event.answer({
                type: "show_snackbar",
                text: "Вы не установили свою группу.",
            });
        }

        const group = await DB.api.models.groups.findOne({ name: groupName });

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
                    "DD.MM.YYYY"
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
            message: vkUtils.scheduleToString({
                ...schedule, selectedDate, groupName
            }),
            keyboard,
        });

        return;
    },
});
