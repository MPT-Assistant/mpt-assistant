import { InlineKeyboard } from "puregram";
import utils from "../../../../../lib/utils";
import TextCommand from "../../../TextCommand";

new TextCommand({
    trigger: ["профиль", "проф", "profile"],
    func: async (context): Promise<unknown> => {
        if (!context.state.user.group) {
            return context.reply(
                `Ваш профиль:
ID: ${context.senderId}
Группа: Не установлена`,
            );
        }

        const { specialty } = await utils.mpt.getExtendGroupInfo(
            context.state.user.group,
        );

        const isReplacementsInform = context.state.user.mailings.replacements;

        const keyboard = InlineKeyboard.keyboard([
            !context.state.chat
                ? [
                    InlineKeyboard.textButton({
                        text: `${
                            isReplacementsInform ? "Отключить" : "Включить"
                        } уведомления`,
                        payload: {
                            cmd: "notify",
                            status: !isReplacementsInform,
                        },
                    }),
                ]
                : [],
            [
                InlineKeyboard.urlButton({
                    text: "Сайт отделения",
                    url: specialty.url,
                }),
            ],
        ]);

        return context.reply(
            `Ваш профиль:
ID: ${context.senderId}
Группа: ${context.state.user.group}
Отделение: ${specialty.name}

Информирование о заменах: ${
    isReplacementsInform ? "Включено" : "Отключено"
}`,
            { reply_markup: keyboard, },
        );
    }
});
