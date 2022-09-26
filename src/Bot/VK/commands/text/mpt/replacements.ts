import DB from "../../../../../lib/DB";
import TextCommand from "../../../TextCommand";
import utils from "../../../../../lib/utils";

new TextCommand({
    trigger: /^(?:замены на|замены)(?:\s(.+))?$/i,
    func: async (context, { utils: vkUtils }): Promise<unknown> => {
        const groupName = context.state.user.group || context.state.chat?.group;

        if (!groupName || groupName === "") {
            return await context.reply(
                `Вы не установили свою группу.
Для установки своей группы введите команду: "Установить группу [Название группы]"${
    context.isChat
        ? ", либо же для установки стандартной группы для чата: \"regchat [Название группы]."
        : ""
}`,
            );
        }

        const groupData = await DB.api.models.groups.findOne({ name: groupName, });

        if (!groupData) {
            return await context.reply(
                "Такой группы не найдено, попробуйте снова установить группу",
            );
        }

        const args = context.text?.match(/^(?:замены на|замены)(?:\s(.+))?$/i);

        const selectedDate = utils.rest.parseSelectedDate(args ? args[1] : undefined);
        const keyboard = vkUtils.generateKeyboard("lessons");

        if (selectedDate.day() === 0) {
            return await context.reply(
                `${selectedDate.format("DD.MM.YYYY")} воскресенье.`,
                { keyboard },
            );
        }

        const replacements = await utils.mpt.getGroupReplacements(
            groupData.name,
            selectedDate,
        );


        if (replacements.length === 0) {
            return await context.reply(
                `на ${selectedDate.format("DD.MM.YYYY")} замен у группы ${
                    groupData.name
                } не найдено`,
                { keyboard },
            );
        } else {
            return await context.reply(vkUtils.replacementsToString({
                replacements, groupName, selectedDate
            }), { keyboard });
        }
    },
});
