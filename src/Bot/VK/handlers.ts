import {
    APIError,
    MessageContext,
    MessageEventContext,
    Updates,
    getRandomId,
} from "vk-io";

import VK from "./";
import { IEventCommandState } from "./EventCommand";
import { ITextCommandState } from "./TextCommand";

class HandlersVK {
    constructor(private readonly _bot: VK) {}

    public async messageNew(ctx: MessageContext): Promise<void> {
        if (
            ctx.isOutbox ||
            ctx.isGroup ||
            !ctx.text ||
            ctx.senderId !== 675114166
        ) {
            return;
        }
        const command = this._bot.utils.textCommands.find(ctx.text);

        if (command) {
            const state: ITextCommandState = {
                user: await this._bot.utils.getUserData(ctx.senderId),
                chat: ctx.isChat
                    ? await this._bot.utils.getChatData(ctx.chatId as number)
                    : undefined,
            };

            ctx.state = state;

            const reply = ctx.reply.bind(ctx);
            ctx.reply = (text, params): ReturnType<typeof reply> => {
                if (typeof text === "string") {
                    text = `@id${ctx.senderId} (${
                        (ctx.state as ITextCommandState).user.nickname
                    }), ${text}`;
                    return reply(text, {
                        disable_mentions: true,
                        ...params,
                    });
                } else {
                    if (text.message) {
                        text.message = `@id${ctx.senderId} (${
                            (ctx.state as ITextCommandState).user.nickname
                        }), ${text.message}`;
                        text.disable_mentions = true;
                    }
                    return reply(text);
                }
            };

            await command.execute(
                ctx as MessageContext<ITextCommandState>,
                this._bot
            );

            await state.user.save();
            if (state.chat) {
                await state.chat.save();
            }
        } else if (!ctx.isChat) {
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

    public async messageEvent(event: MessageEventContext): Promise<void> {
        const isPayloadObject = (
            payload: MessageEventContext["eventPayload"]
        ): payload is { [key: string]: string; cmd: string } => {
            return typeof payload === "object";
        };

        if (!isPayloadObject(event.eventPayload)) {
            return;
        }

        const command = this._bot.utils.eventCommands.find(
            event.eventPayload.cmd
        );

        if (!command) {
            return;
        }

        const state: IEventCommandState = {
            user: await this._bot.utils.getUserData(event.userId),
            chat:
                event.peerId > 2e9
                    ? await this._bot.utils.getChatData(event.peerId - 2e9)
                    : undefined,
            editParentMessage: async (params) => {
                if (params.message) {
                    params.message = `@id${event.userId} (${state.user.nickname}), ${params.message}`;
                }

                try {
                    return await this._bot.instance.api.messages.edit({
                        ...params,
                        peer_id: event.peerId,
                        conversation_message_id: event.conversationMessageId,
                        disable_mentions: true,
                    });
                } catch (error) {
                    if (error instanceof APIError) {
                        if (error.code === 909) {
                            await this._bot.instance.api.messages.send({
                                ...params,
                                random_id: getRandomId(),
                                peer_id: event.peerId,
                                forward: JSON.stringify({
                                    peer_id: event.peerId,
                                    conversation_message_ids:
                                        event.conversationMessageId,
                                    is_reply: true,
                                }),
                                disable_mentions: true,
                            });
                            await event.answer({
                                type: "show_snackbar",
                                text: "Отправлено в новом сообщении",
                            });
                            return;
                        }
                    }
                    return;
                }
            },
        };

        console.log(event.eventPayload);
    }

    public bind(updates: Updates): void {
        updates.on("message_new", this.messageNew.bind(this));
        updates.on("message_event", this.messageEvent.bind(this));
    }
}

export default HandlersVK;
