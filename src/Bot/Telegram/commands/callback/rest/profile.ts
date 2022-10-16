import CallbackCommand from "../../../CallbackCommand";
import utils from "../../../../../lib/utils";
import { InlineKeyboard } from "puregram";

new CallbackCommand({
    trigger: "profile",
    func: async (ctx): Promise<unknown> => {
        if (!ctx.state.user.group) {
            return await ctx.message?.editMessageText(
                `${ctx.from?.username as string}, Ваш профиль:
ID: ${ctx.senderId}
Группа: Не установлена`,
            );
        }

        const { specialty } = await utils.mpt.getExtendGroupInfo(
            ctx.state.user.group,
        );

        const keyboard = InlineKeyboard.keyboard([
            !ctx.state.chat
                ? [
                    InlineKeyboard.textButton({
                        text: `${
                            ctx.state.user.mailings.replacements ? "Отключить" : "Включить"
                        } уведомления`,
                        payload: {
                            cmd: "mailing.replacements",
                            status: !ctx.state.user.mailings.replacements,
                        },
                    }),
                ]
                : [],
            [
                InlineKeyboard.urlButton({
                    text: "Сайт отделения",
                    url: specialty.url,
                }),
            ],
            [
                InlineKeyboard.textButton({
                    text: "Расписание",
                    payload: { cmd: "lessons", },
                }),
            ],
            [
                InlineKeyboard.textButton({
                    text: "Замены",
                    payload: { cmd: "replacements", },
                }),
            ],
        ]);

        return await ctx.message?.editMessageText(
            `${ctx.from?.username as string}, Ваш профиль:
ID: ${ctx.senderId}
Группа: ${ctx.state.user.group}
Отделение: ${specialty.name}
Информирование о заменах: ${
    ctx.state.user.mailings.replacements ? "Включено" : "Отключено"
}`,
            { reply_markup: keyboard, },
        );
    },
});
