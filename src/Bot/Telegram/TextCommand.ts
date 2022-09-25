import {
    Command, ICommandParams, Manager
} from "@rus-anonym/commands-manager";
import { MessageContext } from "puregram";
import utils from "@rus-anonym/utils";
import { IChat, IUser } from "../../lib/DB/Telegram/types";
import TelegramBot from ".";
import { Require } from "puregram/types";
import { PromptContext } from "@puregram/prompt";

interface ITextCommandState {
    user: IUser;
    chat?: IChat;
}

type TTextCommandContext = MessageContext & PromptContext & { state: ITextCommandState } & Require<MessageContext, "from" | "senderId">;

type TRegExpCommandFunc = (
    ctx: TTextCommandContext,
    bot: TelegramBot
) => Promise<unknown>;

class TextCommand extends Command<TRegExpCommandFunc> {
    private _regex: RegExp;

    public readonly isPrivateCommand: boolean;
    public readonly isChatCommand: boolean;

    constructor(
        params: ICommandParams<TRegExpCommandFunc> & {
            trigger: RegExp | string | string[];
            isPrivateCommand?: boolean;
            isChatCommand?: boolean;
        }
    ) {
        super(params);
        this.isPrivateCommand = params.isPrivateCommand ?? true;
        this.isChatCommand = params.isChatCommand ?? true;

        if (typeof params.trigger === "string") {
            params.trigger = new RegExp(
                `^${utils.regular.escapeRegExp(params.trigger)}$`,
                "i"
            );
        }

        if (Array.isArray(params.trigger)) {
            params.trigger = new RegExp(
                `^(${params.trigger
                    .map(utils.regular.escapeRegExp.bind(utils.regular))
                    .join("|")})$`,
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

const manager = new Manager<TextCommand, TRegExpCommandFunc>();

export { manager };

export type {
    TTextCommandContext, TRegExpCommandFunc, ITextCommandState
};

export default TextCommand;
