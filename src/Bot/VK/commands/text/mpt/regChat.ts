import { Keyboard } from "vk-io";

import utils from "../../../../../lib/utils";
import TextCommand from "../../../TextCommand";

new TextCommand({
    trigger: /^(?:regchat|привязать)(?:\s(.*))?$/i,
    func: async (context): Promise<unknown> => {
        if (context.isDM || !context.state.chat) {
            return await context.reply("команда доступна только в беседах.");
        }

        const args = context.text?.match(/^(?:regchat|привязать)(?:\s(.*))?$/i,);

        if (!args || !args[1]) {
            return context.reply("укажите группу");
        }


        const group = await utils.mpt.findGroup(args[1]);

        if (Array.isArray(group)) {
            let responseText = "\nВозможно вы имели в виду какую то из этих групп:";
            const responseKeyboard = Keyboard.builder().inline();
            const buttonColors = [
                Keyboard.POSITIVE_COLOR,
                Keyboard.SECONDARY_COLOR,
                Keyboard.NEGATIVE_COLOR,
            ];
            for (let i = 0; i < 3; ++i) {
                responseKeyboard.callbackButton({
                    label: group[i],
                    color: buttonColors[i],
                    payload: {
                        cmd: "regChat",
                        group: group[i],
                    },
                });
                responseKeyboard.row();

                responseText += `\n${i + 1}. ${group[i]}`;
            }
            return await context.reply(
                `группы ${args[1]} не найдено, попробуйте ещё раз.${responseText}`,
                { keyboard: responseKeyboard },
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
