import { MessageContext } from "puregram";
import { Updates } from "puregram/lib/updates";

import TelegramBot from ".";
import {  TTextCommandContext } from "./TextCommand";

class HandlersTelegram {
    constructor(private readonly _bot: TelegramBot) {}

    public async message(ctx: MessageContext): Promise<void> {
        const reply = ctx.reply.bind(ctx);

        ctx.reply = (text, params): ReturnType<typeof reply> => {
            if (!ctx.isPM()) {
                text = `${ctx.from?.username || ""}, ${text}`;
            } else {
                text = text[0].toUpperCase() + text.slice(1);
            }
            return reply(text, params);
        };

        if (!ctx.hasText() || !ctx.hasFrom() || ctx.from.isBot()) {
            if (ctx.isPM()) {
                await ctx.reply(
                    "такой команды не существует\nСписок команд: https://vk.com/@mpt_assistant-helps"
                );
            }
            return;
        }

        if (!ctx.isPM() && !ctx.text.includes("@mpt_assistant_bot")) {
            return;
        }

        let cmd: string;

        if (ctx.hasEntities("bot_command")) {
            cmd = ctx.text.replace("@mpt_assistant_bot", "").substring(1);
        } else {
            cmd = ctx.text.startsWith("/") ? ctx.text.substring(1) : ctx.text;
        }

        const command = this._bot.utils.textCommands.find(cmd);

        if (command) {
            const state = {
                user: await this._bot.utils.getUserData(ctx.from.id),
                chat:
                    !ctx.isPM() && ctx.isGroup()
                        ? await this._bot.utils.getChatData(ctx.chatId)
                        : undefined,
            };

            (ctx as TTextCommandContext).state = state;

            await command.execute(
                ctx as TTextCommandContext,
                this._bot
            );
            await state.user.save();
            if (state.chat) {
                await state.chat.save();
            }
        } else if (ctx.isPM()) {
            await ctx.reply(
                "такой команды не существует\nСписок команд: https://vk.com/@mpt_assistant-helps"
            );
        }
    }

    public bind(updates: Updates): void {
        updates.on("message", this.message.bind(this));
    }
}

export default HandlersTelegram;
