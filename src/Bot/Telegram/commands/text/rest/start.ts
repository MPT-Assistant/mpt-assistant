import { InlineKeyboard } from "puregram";
import { PromptAnswer } from "@puregram/prompt";

import utils from "../../../../../lib/utils";
import TextCommand from "../../../TextCommand";

new TextCommand({
    trigger: "start",
    isPrivateCommand: false,
    isChatCommand: false,
    func: async (context): Promise<unknown> => {
        if (!context.isPM()) {
            return;
        }

        let groupAnswer: PromptAnswer | undefined;

        while (!groupAnswer || !groupAnswer.text) {
            groupAnswer = await context.promptReply("Привет, введи свою группу");
        }

        const group = await utils.mpt.findGroup(groupAnswer.text);

        if (Array.isArray(group)) {
            const responseText = "\nВозможно вы имели в виду какую то из этих групп:";

            const keyboard = InlineKeyboard.keyboard(
                group.map((name) => {
                    return InlineKeyboard.textButton({
                        text: name,
                        payload: {
                            cmd: "setGroup",
                            group: name,
                        },
                    });
                }),
            );

            return await context.reply(
                `группы ${groupAnswer.text} не найдено, попробуйте ещё раз.${responseText}`,
                { reply_markup: keyboard },
            );
        } else {
            context.state.user.group = group.name;
            return await context.reply(
                `Вы установили себе группу ${group.name}
Отделение: ${group.specialty}`,
                { reply_markup: InlineKeyboard.keyboard([
                    InlineKeyboard.textButton({
                        text: "Профиль",
                        payload: { cmd: "profile", },
                    }),
                    InlineKeyboard.textButton({
                        text: "Расписание",
                        payload: { cmd: "lessons", },
                    }),
                    InlineKeyboard.textButton({
                        text: "Замены",
                        payload: { cmd: "replacements", },
                    }),
                ]), },
            );
        }
    }
});
