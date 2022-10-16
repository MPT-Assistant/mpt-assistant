import { InlineKeyboard } from "puregram";
import utils from "../../../../../lib/utils";
import TextCommand from "../../../TextCommand";

new TextCommand({
    trigger: ["chat", "чат"],
    isPrivateCommand: false,
    cmdTrigger: "chat",
    description: "Информация о чате",
    func: async (context): Promise<unknown> => {
        if (!context.state.chat) {
            return await context.reply("доступно только в беседах");
        }

        if (!context.state.chat.group) {
            return await context.reply(
                `беседа #${context.chatId}
Группа: Не установлена`,
            );
        }

        const { specialty } = await utils.mpt.getExtendGroupInfo(
            context.state.chat.group,
        );

        const isReplacementsInform = context.state.chat.mailings.replacements;

        const keyboard = InlineKeyboard.keyboard([
            [
                InlineKeyboard.textButton({
                    text: `${
                        isReplacementsInform ? "Отключить" : "Включить"
                    } уведомления`,
                    payload: {
                        cmd: "mailing.replacements",
                        status: !isReplacementsInform,
                    },
                }),
            ],
            [
                InlineKeyboard.urlButton({
                    text: "Сайт отделения",
                    url: specialty.url,
                }),
            ]
        ]);

        return context.reply(
            `беседа #${Math.abs(context.chatId)}
Группа: ${context.state.chat.group}
Отделение: ${specialty.name}

Информирование о заменах: ${
    isReplacementsInform ? "Включено" : "Отключено"
}`,
            { reply_markup: keyboard, },
        );
    }
});
