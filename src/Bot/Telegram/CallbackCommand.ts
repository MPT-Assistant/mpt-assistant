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

type TCallbackCommandFunc = (
    ctx: CallbackQueryContext & { state: ICallbackCommandState },
    bot: TelegramBot
) => Promise<unknown>;

class EventCommand extends Command<TCallbackCommandFunc> {
    private _event: string;

    constructor(
        params: ICommandParams<TCallbackCommandFunc> & {
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

const manager = new Manager<EventCommand, TCallbackCommandFunc>();

export { manager };

export type { TCallbackCommandFunc, ICallbackCommandState as IEventCommandState };

export default EventCommand;
