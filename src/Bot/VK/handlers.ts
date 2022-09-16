import { MessageContext, Updates } from "vk-io";

import VK from "./";

class HandlersVK {
    constructor(private readonly _bot: VK ) {}

    public async messageNew(ctx: MessageContext): Promise<void> {
        const { text } = ctx;

        if (text === "group") {
            const user = await this._bot.utils.getUserData(ctx.senderId);
            await ctx.reply(user.group || "no group");
        }
    }

    public bind(updates: Updates): void {
        updates.on("message_new", this.messageNew.bind(this));
    }
}

export default HandlersVK;
