
import { PromptAnswer } from "@puregram/prompt";
import { InlineKeyboard } from "puregram";
import utils from "../../../../../lib/utils";
import TextCommand from "../../../TextCommand";

new TextCommand({
    trigger: /^(?:установить группу|уг|setGroup)(?:\s(.*))?$/i,
    cmdTrigger: "setgroup",
    description: "Установить группу по умолчанию",
    isChatCommand: false,
    func: async (context): Promise<unknown> => {
        let args = context.text?.match(/^(?:установить группу|уг|setGroup)(?:\s(.*))?$/i);

        if (!args || !args[1]) {
            let groupAnswer: PromptAnswer | undefined;

            while (!groupAnswer || !groupAnswer.text) {
                groupAnswer = await context.promptReply("Введите вашу группу");
            }

            args = ["", groupAnswer.text];
        }

        const group = await utils.mpt.findGroup(args[1]);

        if (Array.isArray(group)) {
            const responseText = `\nВозможно вы имели в виду какую то из этих групп:
${group.map((name, index) => `${index + 1}. ${name}`).join("\n")}`;

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
                `группы ${args[1]} не найдено, попробуйте ещё раз.${responseText}`,
                { reply_markup: keyboard },
            );
        } else {
            context.state.user.group = group.name;
            return await context.reply(
                `Вы установили себе группу ${group.name}
Отделение: ${group.specialty}`,
                {
                    reply_markup: InlineKeyboard.keyboard([
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
                    ]),
                }
            );
        }
    },
});
