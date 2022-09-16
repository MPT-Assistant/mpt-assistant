import {
    ContextDefaultState, MessageContext, VK 
} from "vk-io";
import { VKOptions } from "vk-io/lib/types";

import Bot from "../Bot";

class VKBot extends Bot {
    public readonly instance: VK;

    constructor(options: Partial<VKOptions> & { token: string }) {
        super();
        this.instance = new VK(options);
        this.instance.updates.on("message_new", this._onMessageNew.bind(this));
    }

    private _onMessageNew(ctx: MessageContext<ContextDefaultState>): void {
        console.log(ctx);
    }

    public start(): Promise<void> {
        return this.instance.updates.start();
    }
}

export default VKBot;
