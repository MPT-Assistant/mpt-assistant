import CallbackCommand from "../../../CallbackCommand";
import utils from "../../../../../lib/utils";
import DB from "../../../../../lib/DB";
import { InlineKeyboard } from "puregram";

new CallbackCommand<{
    date: string;
}>({
    trigger: "replacements",
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

        const keyboard = tgUtils.generateKeyboard("replacements");
        const replacements = await utils.mpt.getGroupReplacements(
            groupName,
            selectedDate
        );

        if (replacements.length === 0) {
            return await ctx.answerCallbackQuery({
                show_alert: true,
                text: `На ${selectedDate.format(
                    "DD.MM.YYYY"
                )} замен у группы ${groupName} не найдено`,
            });
        }

        keyboard.push([
            InlineKeyboard.textButton({
                text: "Расписание",
                payload: {
                    cmd: "lessons",
                    date: selectedDate.format("DD.MM.YYYY"),
                },
            }),
        ]);

        await ctx.message
            ?.editMessageText(
                `${
                    ctx.from?.username as string
                }, ${tgUtils.replacementsToString({
                    replacements,
                    groupName,
                    selectedDate,
                })}`,
                { reply_markup: InlineKeyboard.keyboard(keyboard) }
            )
            .catch(() => null);
    },
});
