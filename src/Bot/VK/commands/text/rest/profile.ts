import { Keyboard } from "vk-io";
import utils from "../../../../../lib/utils";

import TextCommand from "../../../TextCommand";

new TextCommand({
    trigger: ["проф", "профиль"],
    func: async (context): Promise<unknown> => {
        if (!context.state.user.group) {
            return context.reply(
                `Ваш профиль:
ID: ${context.senderId}
Группа: Не установлена`,
            );
        }

        const isReplacementsInform = context.state.user.mailings.replacements;

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
            context.state.user.group,
        );

        keyboard.row().urlButton({
            label: "Сайт отделения",
            url: specialty.url,
        });

        return context.reply(
            `Ваш профиль:
ID: ${context.senderId}
Группа: ${context.state.user.group}
Отделение: ${specialty.name}

Информирование о заменах: ${
    isReplacementsInform ? "Включено" : "Отключено"
}`,
            { keyboard: keyboard.inline(), },
        );
    },
});
