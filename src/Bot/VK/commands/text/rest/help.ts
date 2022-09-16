import TextCommand from "../../../TextCommand";

new TextCommand({
    trigger: ["помощь", "help", "start", "команды"],
    func: async (ctx): Promise<void> => {
        await ctx.reply(
            `${
                !ctx.isChat
                    ? "Для использования полного функционала бота рекомендуется добавить его в беседу.\n"
                    : ""
            }Список команд:`,
            { attachment: "article-188434642_189203_12d88f37969ae1c641" }
        );
        return;
    },
});
