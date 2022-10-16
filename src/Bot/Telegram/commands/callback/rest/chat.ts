import CallbackCommand from "../../../CallbackCommand";
import utils from "../../../../../lib/utils";
import { InlineKeyboard } from "puregram";

new CallbackCommand({
    trigger: "chat",
    func: async (ctx): Promise<unknown> => {
        if (!ctx.state.chat) {
            return await ctx.message?.editMessageText(
                `${ctx.from?.username as string}, доступно только в беседах`,
            );
        }

        if (!ctx.state.chat.group) {
            return await ctx.message?.editMessageText(
                `${ctx.from?.username as string}, беседа #${ctx.message.chatId}
Группа: Не установлена`,
            );
        }

        const { specialty } = await utils.mpt.getExtendGroupInfo(
            ctx.state.chat.group,
        );

        const keyboard = InlineKeyboard.keyboard([
            [
                InlineKeyboard.textButton({
                    text: `${
                        ctx.state.chat.mailings.replacements ? "Отключить" : "Включить"
                    } уведомления`,
                    payload: {
                        cmd: "notify",
                        status: !ctx.state.chat.mailings.replacements,
                    },
                }),
            ],
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
            `${ctx.from?.username as string}, беседа #${ctx.message.chatId}
Группа: ${ctx.state.chat.group}
Отделение: ${specialty.name}
Информирование о заменах: ${
    ctx.state.chat.mailings.replacements ? "Включено" : "Отключено"
}`,
            { reply_markup: keyboard, },
        );
    },
});
