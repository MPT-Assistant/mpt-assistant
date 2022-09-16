import { MessageContext, Updates } from "vk-io";

import VK from "./";
import { ITextCommandState } from "./TextCommand";

class HandlersVK {
    constructor(private readonly _bot: VK) {}

    public async messageNew(ctx: MessageContext): Promise<void> {
        if (ctx.isOutbox || ctx.isGroup || !ctx.text) {
            return;
        }
        const command = this._bot.utils.textCommands.find(ctx.text);

        if (command) {
            const state: ITextCommandState = {
                user: await this._bot.utils.getUserData(ctx.senderId),
                chat: ctx.isChat ? await this._bot.utils.getChatData(ctx.chatId as number) : undefined
            };

            ctx.state = state;

            const reply = ctx.reply.bind(ctx);
            ctx.reply = (text, params): ReturnType<typeof reply> => {
                if (typeof text === "string") {
                    text = `@id${ctx.senderId} (${(ctx.state as ITextCommandState).user.nickname}), ${text}`;
                    return reply(text, {
                        disable_mentions: true, ...params
                    });
                } else {
                    if (text.message) {
                        text.message = `@id${ctx.senderId} (${(ctx.state as ITextCommandState).user.nickname}), ${text.message}`;
                        text.disable_mentions = true;
                    }
                    return reply(text);
                }
            };


            await command.execute(ctx as MessageContext<ITextCommandState>);
        } else if  (!ctx.isChat) {
            if (
                (ctx.messagePayload as { command?: string }).command &&
                (ctx.messagePayload as { command: string }).command === "start"
            ) {
                await ctx.reply(`Привет! 
Для начала нужно установить группу. 
Напиши «Установить группу *твоя группа*»`);
                return;
            }
            await ctx.reply({
                message: "Такой команды не существует\nСписок команд:",
                attachment: "article-188434642_189203_12d88f37969ae1c641",
            });
        }
    }

    public bind(updates: Updates): void {
        updates.on("message_new", this.messageNew.bind(this));
    }
}

export default HandlersVK;
