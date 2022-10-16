import CallbackCommand from "../../../CallbackCommand";
import { InlineKeyboard } from "puregram";

new CallbackCommand<{
    status: boolean;
}>({
    trigger: "mailing.replacements",
    func: async (ctx): Promise<unknown> => {
        const status = Boolean(ctx.queryPayload.status);

        if (ctx.state.chat) {
            ctx.state.chat.mailings.replacements = status;
            return await ctx.message?.editMessageText(
                `@${ctx.from?.username as string}, рассылка замен в чат ${
                    status ? "включена" : "отключена"
                }`,
                { reply_markup: InlineKeyboard.keyboard([
                    InlineKeyboard.textButton({
                        text: "Чат",
                        payload: { cmd: "chat", },
                    }),
                ]), },
            );
        } else {
            ctx.state.user.mailings.replacements = status;
            return await ctx.message?.editMessageText(
                `${ctx.from?.username as string}, рассылка замен ${
                    status ? "включена" : "отключена"
                }`,
                { reply_markup: InlineKeyboard.keyboard([
                    InlineKeyboard.textButton({
                        text: "Профиль",
                        payload: { cmd: "profile", },
                    }),
                ]), },
            );
        }
    },
});
