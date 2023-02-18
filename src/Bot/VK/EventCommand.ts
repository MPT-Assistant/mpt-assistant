import {
    Command, ICommandParams, Manager
} from "@rus-anonym/commands-manager";
import { MessageEventContext, Params } from "vk-io";
import { IChat, IUser } from "../../lib/DB/VK/types";
import VK from ".";

interface IEventCommandState {
    user: IUser;
    chat?: IChat;
    editParentMessage(
        params: Partial<Params.MessagesEditParams>
    ): Promise<unknown>;
}

type TCallbackCommandFunc = (
    ctx: MessageEventContext<IEventCommandState>,
    bot: VK
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

const manager = new Manager<EventCommand>();

export { manager };

export type { TCallbackCommandFunc, IEventCommandState };

export default EventCommand;
