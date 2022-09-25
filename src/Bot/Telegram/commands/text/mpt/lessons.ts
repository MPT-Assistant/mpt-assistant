import DB from "../../../../../lib/DB";
import TextCommand from "../../../TextCommand";
import utils from "../../../../../lib/utils";
import { InlineKeyboard } from "puregram";

new TextCommand({
    trigger: /^(?:расписание|рп|какие пары|schedule)(?:\s(.+))?$/i,
    cmdTrigger: "schedule",
    description: "Расписание",
    func: async (context, { utils: tgUtils }): Promise<unknown> => {
        const groupName = context.state.user.group || context.state.chat?.group;

        if (!groupName || groupName === "") {
            return await context.reply(
                `Вы не установили свою группу.
Для установки своей группы введите команду: "Установить группу [Название группы]"${
    context.state.chat && context.state.chat.group === ""
        ? ", либо же для установки стандартной группы для чата: \"regchat [Название группы]."
        : ""
}`,
            );
        }

        const groupData = await DB.api.models.groups.findOne({ name: groupName, });

        if (!groupData) {
            return await context.reply(
                "такой группы не найдено, попробуйте снова установить группу",
            );
        }

        const args = context.text?.match(/^(?:расписание|рп|какие пары|schedule)(?:\s(.+))?$/i);

        const selectedDate = utils.rest.parseSelectedDate(args ? args[1] : undefined);
        const keyboard = tgUtils.generateKeyboard("lessons");

        if (selectedDate.day() === 0) {
            return await context.reply(
                `${selectedDate.format("DD.MM.YYYY")} воскресенье.`,
                { reply_markup: InlineKeyboard.keyboard(keyboard) },
            );
        }

        const schedule = await utils.mpt.getGroupSchedule(groupData, selectedDate);

        if (schedule.lessons.length === 0) {
            return await context.reply(
                `на ${selectedDate.format("DD.MM.YYYY")} пар у группы ${
                    groupData.name
                } не найдено`,
                { reply_markup: InlineKeyboard.keyboard(keyboard) },
            );
        }

        if (schedule.replacements.length !== 0) {
            keyboard.push([
                InlineKeyboard.textButton({
                    text: "Замены",
                    payload: {
                        cmd: "replacements",
                        date: selectedDate.format("DD.MM.YYYY"),
                    },
                }),
            ]);
        }

        return await context.reply(tgUtils.scheduleToString({
            ...schedule, groupName: groupData.name, selectedDate
        }), { reply_markup: InlineKeyboard.keyboard(keyboard), });
    },
});
