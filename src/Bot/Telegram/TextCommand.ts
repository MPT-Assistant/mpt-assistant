import {
    Command, ICommandParams, Manager
} from "@rus-anonym/commands-manager";
import { MessageContext } from "puregram";
import utils from "@rus-anonym/utils";
import { IChat, IUser } from "../../lib/DB/Telegram/types";
import TelegramBot from ".";
import { Require } from "puregram/types";
import { PromptContext } from "@puregram/prompt";
import { TelegramBotCommand } from "puregram/generated";

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
    private _regexp: RegExp;

    public readonly trigger?: string;
    public readonly description?: string;
    public readonly isPrivateCommand: boolean;
    public readonly isChatCommand: boolean;

    constructor(
        params: ICommandParams<TRegExpCommandFunc> & {
            trigger: RegExp | string | string[];
            cmdTrigger?: string;
            description?: string;
            isPrivateCommand?: boolean;
            isChatCommand?: boolean;
        }
    ) {
        super(params);
        this.trigger = params.cmdTrigger;
        this.description = params.description;
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

        this._regexp = params.trigger;
        manager.add(this);
    }

    public check(value: string): boolean {
        return this._regexp.test(value);
    }
}

class TextCommandManager extends Manager<TextCommand, TRegExpCommandFunc> {
    public getUserCommands(): TelegramBotCommand[] {
        const userCommands = this.list.filter(x => x.isPrivateCommand);
        const response: TelegramBotCommand[] = [];

        for (const command of userCommands) {
            if (command.trigger && command.description) {
                response.push({
                    command: command.trigger,
                    description: command.description,
                });
            }
        }

        return response;
    }

    public getChatCommands(): TelegramBotCommand[] {
        const userCommands = this.list.filter(x => x.isChatCommand);
        const response: TelegramBotCommand[] = [];

        for (const command of userCommands) {
            if (command.trigger && command.description) {
                response.push({
                    command: command.trigger,
                    description: command.description,
                });
            }
        }

        return response;
    }
}

const manager = new TextCommandManager();

export { manager };

export type {
    TTextCommandContext, TRegExpCommandFunc, ITextCommandState
};

export default TextCommand;
