
import { Keyboard } from "vk-io";
import DB from "../../../../../lib/DB";
import TextCommand from "../../../TextCommand";
import utils from "../../../../../lib/utils";

new TextCommand({
    trigger: /^(?:расписание|рп|какие пары)(?:\s(.+))?$/i,
    func: async (context, { utils: vkUtils }): Promise<unknown> => {
        const groupName = context.state.user.group || context.state.chat?.group;

        if (!groupName || groupName === "") {
            return await context.reply(
                `Вы не установили свою группу.
Для установки своей группы введите команду: "Установить группу [Название группы]"${
    context.isChat
        ? ", либо же для установки стандартной группы для чата: \"regchat [Название группы]."
        : ""
}`,
            );
        }

        const groupData = await DB.api.models.groups.findOne({ name: groupName, });

        if (!groupData) {
            return await context.reply(
                "Такой группы не найдено, попробуйте снова установить группу",
            );
        }

        const args = context.text?.match(/^(?:расписание|рп|какие пары)(?:\s(.+))?$/i);

        const selectedDate = utils.rest.parseSelectedDate(args ? args[1] : undefined);
        const keyboard = vkUtils.generateKeyboard("lessons");

        if (selectedDate.day() === 0) {
            return await context.reply(
                `${selectedDate.format("DD.MM.YYYY")} воскресенье.`,
                { keyboard },
            );
        }

        const schedule = await utils.mpt.getGroupSchedule(groupData, selectedDate);

        if (schedule.lessons.length === 0) {
            return await context.reply(
                `на ${selectedDate.format("DD.MM.YYYY")} пар у группы ${
                    groupData.name
                } не найдено`,
                { keyboard },
            );
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

        return await context.reply(vkUtils.scheduleToString({
            ...schedule, groupName: groupData.name, selectedDate
        }), { keyboard });
    },
});
