
import { PromptAnswer } from "@puregram/prompt";
import { InlineKeyboard } from "puregram";
import utils from "../../../../../lib/utils";
import TextCommand from "../../../TextCommand";

new TextCommand({
    trigger: /^(?:regchat|привязать)(?:\s(.*))?$/i,
    func: async (context): Promise<unknown> => {
        if (!context.state.chat) {
            return await context.reply("команда доступна только в беседах");
        }

        let args = context.text?.match(/^(?:regchat|привязать)(?:\s(.*))?$/i);

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
                            cmd: "regChat",
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
            context.state.chat.group = group.name;
            return await context.reply(
                `Вы установили для беседы группу по умолчанию ${group.name}
Отделение: ${group.specialty}`,
            );
        }
    },
});
