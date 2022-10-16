import { Keyboard, MessageEventContext } from "vk-io";
import DB from "../../../../../lib/DB";
import EventCommand from "../../../EventCommand";

const isSetGroupCommand = (
    payload: MessageEventContext["eventPayload"]
): payload is { group: string; cmd: "setGroup" } => {
    return typeof payload === "object";
};

new EventCommand({
    trigger: "setGroup",
    func: async (event): Promise<unknown> => {
        if (!event.state.chat || !isSetGroupCommand(event.eventPayload)) {
            return;
        }

        const selectedGroup = await DB.api.models.groups.findOne({ name: new RegExp(`^${event.eventPayload.group}$`, "i"), });

        if (!selectedGroup) {
            return await event.answer({
                type: "show_snackbar",
                text: `Группы ${event.eventPayload.group} не найдено`,
            });
        } else {
            event.state.user.group = selectedGroup.name;

            const keyboard = Keyboard.builder()
                .inline()
                .callbackButton({
                    label: "Профиль",
                    payload: { cmd: "profile", },
                });

            return await Promise.all([
                event.state.editParentMessage({
                    message: `Вы установили себе группу ${selectedGroup.name}\nОтделение: ${selectedGroup.specialty}`,
                    keyboard,
                }),
                event.answer({
                    type: "show_snackbar",
                    text: `Вы установили себе группу ${selectedGroup.name}.\n(${selectedGroup.specialty})`,
                }),
            ]);
        }
    },
});
