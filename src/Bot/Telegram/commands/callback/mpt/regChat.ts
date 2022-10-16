import CallbackCommand from "../../../CallbackCommand";
import utils from "../../../../../lib/utils";

new CallbackCommand<{
    group: string;
}>({
    trigger: "regChat",
    func: async (ctx): Promise<unknown> => {
        if (!ctx.state.chat) {
            return;
        }

        const selectedGroup = await utils.mpt.findGroup(ctx.queryPayload.group);

        if (Array.isArray(selectedGroup)) {
            return await ctx.answerCallbackQuery({
                show_alert: true,
                text: `Группы ${ctx.queryPayload.group} не найдено`,
            });
        } else {
            ctx.state.chat.group = selectedGroup.name;

            await ctx.answerCallbackQuery({
                show_alert: true,
                text: `Вы установили чату группу ${selectedGroup.name}.\n(${selectedGroup.specialty})`,
            });

            return await ctx.message?.editMessageText(
                `@${ctx.from?.username as string}, установил группу для чата по умолчанию\nГруппа: ${selectedGroup.name}\nОтделение: ${selectedGroup.specialty}`,
            );
        }
    },
});
