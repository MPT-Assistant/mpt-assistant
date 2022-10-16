import { Keyboard } from "vk-io";
import utils from "../../../../../lib/utils";

import TextCommand from "../../../TextCommand";

new TextCommand({
    trigger: "чат",
    func: async (context): Promise<unknown> => {
        if (!context.state.chat) {
            return context.reply("доступно только в беседах.");
        }

        if (!context.state.chat.group) {
            return context.reply(
                `беседа #${context.chatId as number}
Группа: Не установлена`,
            );
        }

        const isReplacementsInform = context.state.chat.mailings.replacements;


        const keyboard = Keyboard.builder().textButton({
            label: `${
                isReplacementsInform ? "Отключить" : "Включить"
            } уведомления`,
            payload: { cmd: `изменения ${
                isReplacementsInform ? "отключить" : "включить"
            }`, },
            color: isReplacementsInform
                ? Keyboard.NEGATIVE_COLOR
                : Keyboard.POSITIVE_COLOR,
        });

        const { specialty } = await utils.mpt.getExtendGroupInfo(
            context.state.chat.group,
        );

        keyboard.row().urlButton({
            label: "Сайт отделения",
            url: specialty.url,
        });

        return context.reply(
            `беседа #${context.chatId as number}
Группа: ${context.state.chat.group}
Отделение: ${specialty.name}

Информирование о заменах: ${
    isReplacementsInform ? "Включено" : "Отключено"
}`,
            { keyboard: keyboard.inline(), },
        );
    },
});
