import TextCommand from "../../../TextCommand";

new TextCommand({
    trigger: /^(?:изменения)(?:\s(вкл|откл)(ючить)?)$/i,
    func: async (ctx): Promise<unknown> => {
        const args = ctx.text?.match(/^(?:изменения)(?:\s(вкл|откл)(ючить)?)$/i);
        const isReplacementsInform = ctx.state.chat ? ctx.state.chat.mailings.replacements : ctx.state.user.mailings.replacements;
        const isEnable = args ? args[1].includes("вкл") : isReplacementsInform;
        if (ctx.state.chat) {
            ctx.state.chat.mailings.replacements = isEnable;
            return ctx.reply(
                `рассылка замен ${isEnable ? "включена" : "отключена"}.`,
            );
        } else {
            ctx.state.user.mailings.replacements = isEnable;
            return ctx.reply(
                `рассылка замен ${isEnable ? "включена" : "отключена"}.`,
            );
        }
    },
});
