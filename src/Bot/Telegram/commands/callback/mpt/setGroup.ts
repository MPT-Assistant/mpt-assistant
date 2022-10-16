import CallbackCommand from "../../../CallbackCommand";
import utils from "../../../../../lib/utils";
import { InlineKeyboard } from "puregram";

new CallbackCommand<{
    group: string;
}>({
    trigger: "setGroup",
    func: async (ctx): Promise<unknown> => {
        const selectedGroup = await utils.mpt.findGroup(ctx.queryPayload.group);

        if (Array.isArray(selectedGroup)) {
            return await ctx.answerCallbackQuery({
                show_alert: true,
                text: `Группы ${ctx.queryPayload.group} не найдено`,
            });
        } else {
            ctx.state.user.group = selectedGroup.name;

            await ctx.answerCallbackQuery({
                show_alert: true,
                text: `Вы установили себе группу ${selectedGroup.name}.\n(${selectedGroup.specialty})`,
            });

            return await ctx.message?.editMessageText(
                `${ctx.from?.username as string}, Вы установили себе группу ${selectedGroup.name}
Отделение: ${selectedGroup.specialty}`,
                { reply_markup: InlineKeyboard.keyboard([
                    InlineKeyboard.textButton({
                        text: "Профиль",
                        payload: { cmd: "profile", },
                    }),
                    InlineKeyboard.textButton({
                        text: "Расписание",
                        payload: { cmd: "lessons", },
                    }),
                    InlineKeyboard.textButton({
                        text: "Замены",
                        payload: { cmd: "replacements", },
                    }),
                ]), },
            );
        }
    },
});
