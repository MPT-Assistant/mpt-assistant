import TextCommand from "../../../TextCommand";

new TextCommand({
    trigger: ["помощь", "help", "start", "команды"],
    func: async (ctx): Promise<void> => {
        await ctx.reply(
            `${
                !ctx.isPM()
                    ? "Для использования полного функционала бота рекомендуется добавить его в беседу.\n"
                    : ""
            }Список команд: https://vk.com/@mpt_assistant-helps`,
        );
        return;
    },
});
