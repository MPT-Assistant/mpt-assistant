import { MessageContext, Updates } from "vk-io";

import VK from "./";

class HandlersVK {
    constructor(private readonly _bot: VK ) {}

    public async messageNew(ctx: MessageContext): Promise<void> {
        const { text } = ctx;

        if (text) {
            const command = this._bot.utils.textCommands.find(text);
            if (command) {
                await command.execute(ctx);
            }
        }
    }

    public bind(updates: Updates): void {
        updates.on("message_new", this.messageNew.bind(this));
    }
}

export default HandlersVK;
