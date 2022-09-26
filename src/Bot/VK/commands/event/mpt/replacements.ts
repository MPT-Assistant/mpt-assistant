import moment from "moment";
import { MessageEventContext } from "vk-io";
import DB from "../../../../../lib/DB";
import utils from "../../../../../lib/utils";
import EventCommand from "../../../EventCommand";

const isReplacementsCommand = (
    payload: MessageEventContext["eventPayload"]
): payload is { date: string; cmd: "replacements" } => {
    return typeof payload === "object";
};

new EventCommand({
    trigger: "replacements",
    func: async (event, { utils: vkUtils }): Promise<unknown> => {
        if (!isReplacementsCommand(event.eventPayload)) {
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

        const groupName = event.state.user.group || event.state.chat?.group;

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

        const replacements = await utils.mpt.getGroupReplacements(
            groupName,
            selectedDate,
        );

        if (replacements.length === 0) {
            return await event.answer({
                type: "show_snackbar",
                text: `На ${selectedDate.format(
                    "DD.MM.YYYY",
                )} замен у группы ${groupName} не найдено`,
            });
        }

        await event.state.editParentMessage({
            message: vkUtils.replacementsToString({
                replacements, groupName, selectedDate
            }),
            keyboard: vkUtils.generateKeyboard("replacements"),
        });

        return;
    },
});
