import {
    Command, ICommandParams, Manager
} from "@rus-anonym/commands-manager";
import { CallbackQueryContext } from "puregram";
import { IChat, IUser } from "../../lib/DB/Telegram/types";
import TelegramBot from ".";

interface ICallbackCommandState {
    user: IUser;
    chat?: IChat;
}

type TCallbackCommandContext = CallbackQueryContext & { state: ICallbackCommandState };

type TCallbackCommandFunc<QueryPayload> = (
    ctx: CallbackQueryContext & {
        state: ICallbackCommandState;
        queryPayload: QueryPayload;
    },
    bot: TelegramBot
) => Promise<unknown>;

class CallbackCommand<QueryPayload = unknown> extends Command<TCallbackCommandFunc<QueryPayload>> {
    private _event: string;

    constructor(
        params: ICommandParams<TCallbackCommandFunc<QueryPayload>> & {
            trigger: string;
        }
    ) {
        super(params);
        this._event = params.trigger;
        manager.add(this);
    }

    public check(value: string): boolean {
        return this._event === value;
    }
}

const manager = new Manager<CallbackCommand>();

export { manager };

export type {
    TCallbackCommandFunc, TCallbackCommandContext, ICallbackCommandState
};

export default CallbackCommand;
