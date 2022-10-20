import { Keyboard } from "vk-io";
import utils from "../../../../../lib/utils";
import EventCommand from "../../../EventCommand";

new EventCommand({
    trigger: "profile",
    func: async (event): Promise<unknown> => {
        if (!event.state.user.group) {
            return await event.answer({
                type: "show_snackbar",
                text: "У вас не установлена группа",
            });
        }

        const isReplacementsInform = event.state.user.mailings.replacements;

        const keyboard = Keyboard.builder().textButton({
            label: `${
                isReplacementsInform ? "Отключить" : "Включить"
            } уведомления`,
            payload: {
                cmd: `изменения ${
                    isReplacementsInform ? "отключить" : "включить"
                }`,
            },
            color: isReplacementsInform
                ? Keyboard.NEGATIVE_COLOR
                : Keyboard.POSITIVE_COLOR,
        });

        const { specialty } = await utils.mpt.getExtendGroupInfo(
            event.state.user.group
        );

        keyboard.row().urlButton({
            label: "Сайт отделения",
            url: specialty.url,
        });

        return await event.state.editParentMessage({
            message: `Ваш профиль:
ID: ${event.userId}
Группа: ${event.state.user.group}
Отделение: ${specialty.name}

Информирование о заменах: ${isReplacementsInform ? "Включено" : "Отключено"}`,
            keyboard: keyboard.inline(),
        });
    },
});
