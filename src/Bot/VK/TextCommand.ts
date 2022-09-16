import {
    Command, ICommandParams, Manager
} from "@rus-anonym/commands-manager";
import { MessageContext } from "vk-io";
import utils from "@rus-anonym/utils";

type TRegExpFunc = (ctx: MessageContext) => Promise<void>;

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
                `^(${utils.regular.escapeRegExp(params.trigger.join("|"))})`,
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

export type { TRegExpFunc };

export default TextCommand;
