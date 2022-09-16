import {
    Command, ICommandParams, Manager
} from "@rus-anonym/commands-manager";
import { MessageContext } from "vk-io";

type TRegExpFunc = (ctx: MessageContext) => Promise<void>;

class RegExpCommand extends Command<TRegExpFunc> {
    private _regex: RegExp;

    constructor(params: ICommandParams<TRegExpFunc> & { trigger: RegExp }) {
        super(params);
        this._regex = params.trigger;
        manager.add(this);
    }

    public check(value: string): boolean {
        return this._regex.test(value);
    }
}

const manager = new Manager<RegExpCommand, TRegExpFunc>();

export { manager };

export type { TRegExpFunc };

export default RegExpCommand;
