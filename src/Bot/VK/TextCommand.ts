import {
    Command, ICommandParams, Manager
} from "@rus-anonym/commands-manager";
import { MessageContext } from "vk-io";
import utils from "@rus-anonym/utils";
import { IChat, IUser } from "../../lib/DB/VK/types";

interface ITextCommandState {
    user: IUser;
    chat?: IChat;
}

type TRegExpFunc = (ctx: MessageContext<ITextCommandState>) => Promise<unknown>;

class TextCommand extends Command<TRegExpFunc> {
    private _regex: RegExp;

    constructor(
        params: ICommandParams<TRegExpFunc> & {
            trigger: RegExp | string | string[];
        }
    ) {
        super(params);

        if (typeof params.trigger === "string") {
            params.trigger = new RegExp(
                `^${utils.regular.escapeRegExp(params.trigger)}`,
                "i"
            );
        }

        if (Array.isArray(params.trigger)) {
            params.trigger = new RegExp(
                `^(${params.trigger
                    .map(utils.regular.escapeRegExp.bind(utils.regular))
                    .join("|")})`,
                "i"
            );
        }

        this._regex = params.trigger;
        manager.add(this);
    }

    public check(value: string): boolean {
        return this._regex.test(value);
    }
}

const manager = new Manager<TextCommand, TRegExpFunc>();

export { manager };

export type { TRegExpFunc, ITextCommandState };

export default TextCommand;
