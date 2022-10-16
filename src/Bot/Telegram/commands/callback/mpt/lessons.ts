import CallbackCommand from "../../../CallbackCommand";
import utils from "../../../../../lib/utils";
import DB from "../../../../../lib/DB";
import { InlineKeyboard } from "puregram";

new CallbackCommand<{
    date: string;
}>({
    trigger: "lessons",
    func: async (ctx, { utils: tgUtils }): Promise<unknown> => {
        const selectedDate = utils.rest.parseSelectedDate(
            ctx.queryPayload.date
        );

        if (!selectedDate.isValid()) {
            return await ctx.answerCallbackQuery({
                show_alert: true,
                text: `Неверная дата ${ctx.queryPayload.date}`,
            });
        }

        if (selectedDate.day() === 0) {
            return await ctx.answerCallbackQuery({
                show_alert: true,
                text: `${selectedDate.format("DD.MM.YYYY")} воскресенье.`,
            });
        }

        const groupName = ctx.state.user.group || ctx.state.chat?.group;

        if (groupName === undefined || groupName === "") {
            return await ctx.answerCallbackQuery({
                show_alert: true,
                text: "Вы не установили свою группу.",
            });
        }

        const group = await DB.api.models.groups.findOne({ name: groupName });

        if (!group) {
            return await ctx.answerCallbackQuery({
                show_alert: true,
                text: "Такой группы не найдено, попробуйте снова установить группу",
            });
        }

        const keyboard = tgUtils.generateKeyboard("lessons");
        const schedule = await utils.mpt.getGroupSchedule(group, selectedDate);

        if (schedule.lessons.length === 0) {
            return ctx.message
                ?.editMessageText(
                    `${ctx.from?.username as string}, на ${selectedDate.format(
                        "DD.MM.YYYY"
                    )} пар у группы ${groupName} не найдено`,
                    { reply_markup: InlineKeyboard.keyboard(keyboard) }
                )
                .catch(() => null);
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

        await ctx.message
            ?.editMessageText(
                `${ctx.from?.username as string}, ${tgUtils.scheduleToString({
                    ...schedule, groupName, selectedDate
                })}`,
                { reply_markup: InlineKeyboard.keyboard(keyboard) }
            )
            .catch(() => null);
    },
});
