import { Keyboard } from "vk-io";

import utils from "../../../../../lib/utils";
import TextCommand from "../../../TextCommand";

new TextCommand({
    trigger: /^(?:установить группу|уг)(?:\s(.*))?$/i,
    func: async (context): Promise<unknown> => {
        const args = context.text?.match(/^(?:установить группу|уг)(?:\s(.*))?$/i);

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
                        cmd: "setGroup",
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
            context.state.user.group = group.name;
            return await context.reply(
                `Вы установили себе группу ${group.name}
Отделение: ${group.specialty}`,
            );
        }
    },
});
