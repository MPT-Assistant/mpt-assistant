import { CallbackQueryContext, MessageContext } from "puregram";
import { Updates } from "puregram/lib/updates";

import TelegramBot from ".";
import { TCallbackCommandContext } from "./CallbackCommand";
import { TTextCommandContext } from "./TextCommand";

class HandlersTelegram {
    constructor(private readonly _bot: TelegramBot) {}

    public async message(ctx: MessageContext): Promise<void> {
        if (ctx.isPM()) {
            void this._bot.instance.api.setMyCommands({
                commands: this._bot.utils.textCommands.getUserCommands(),
                scope: {
                    type: "chat",
                    chat_id: ctx.chat.id,
                },
            });
        } else {
            void this._bot.instance.api.setMyCommands({
                commands: this._bot.utils.textCommands.getChatCommands(),
                scope: {
                    type: "chat",
                    chat_id: ctx.chat.id,
                },
            });
        }

        const reply = ctx.reply.bind(ctx);

        ctx.reply = (text, params): ReturnType<typeof reply> => {
            if (!ctx.isPM()) {
                text = `${ctx.from?.username || ""}, ${text}`;
            } else {
                text = text[0].toUpperCase() + text.slice(1);
            }
            return reply(text, { ...params });
        };

        if (!ctx.hasText() || !ctx.hasFrom() || ctx.from.isBot()) {
            if (ctx.isPM()) {
                await ctx.reply(
                    "такой команды не существует\nСписок команд: https://vk.com/@mpt_assistant-helps"
                );
            }
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
                chat: !ctx.isPM()
                    ? await this._bot.utils.getChatData(ctx.chatId)
                    : undefined,
            };

            (ctx as TTextCommandContext).state = state;

            await command.execute(ctx as TTextCommandContext, this._bot);
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

    public async callbackQuery(
        ctx: CallbackQueryContext & {
            queryPayload?: { cmd?: string };
        }
    ): Promise<void> {
        if (!ctx.from || ctx.from.isBot() || !ctx?.queryPayload?.cmd) {
            return;
        }

        const command = this._bot.utils.callbackCommands.find(
            ctx.queryPayload.cmd
        );

        if (!command) {
            return;
        }

        const state = {
            user: await this._bot.utils.getUserData(ctx.from.id),
            chat:
                !ctx.message?.isPM() && ctx.message?.chatId
                    ? await this._bot.utils.getChatData(ctx.message?.chatId)
                    : undefined,
        };

        (ctx as TCallbackCommandContext).state = state;

        await command.execute(ctx as TCallbackCommandContext, this._bot);
        await ctx.answerCallbackQuery();
        await state.user.save();
        if (state.chat) {
            await state.chat.save();
        }
    }

    public bind(updates: Updates): void {
        updates.use(this._bot.utils.promptManager.middleware);

        updates.on("message", this.message.bind(this));
        updates.on("callback_query", this.callbackQuery.bind(this));
    }
}

export default HandlersTelegram;
