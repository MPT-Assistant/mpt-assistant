import utils from "@rus-anonym/utils";
import TextCommand from "../../../TextCommand";

new TextCommand({
    trigger: "/ping",
    func: async (ctx): Promise<void> => {
        await ctx.reply("pong", { attachment: utils.array.random([
            "audio675114166_456239880",
            "audio675114166_456239881",
        ]) });
        return;
    },
});
