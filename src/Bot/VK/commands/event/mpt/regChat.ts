import { Keyboard, MessageEventContext } from "vk-io";
import DB from "../../../../../lib/DB";
import EventCommand from "../../../EventCommand";

const isRegChatCommand = (
    payload: MessageEventContext["eventPayload"]
): payload is { group: string; cmd: "regChat" } => {
    return typeof payload === "object";
};

new EventCommand({
    trigger: "regChat",
    func: async (event): Promise<unknown> => {
        if (!event.state.chat || !isRegChatCommand(event.eventPayload)) {
            return;
        }

        const selectedGroup = await DB.api.models.groups.findOne({ name: new RegExp(`^${event.eventPayload.group}$`, "i"), });

        if (!selectedGroup) {
            return await event.answer({
                type: "show_snackbar",
                text: `Группы ${event.eventPayload.group} не найдено`,
            });
        } else {
            event.state.chat.group = selectedGroup.name;

            await event.answer({
                type: "show_snackbar",
                text: `Вы установили чату группу ${selectedGroup.name}.\n(${selectedGroup.specialty})`,
            });

            return await event.state.editParentMessage({
                conversation_message_id: event.conversationMessageId,
                keyboard: Keyboard.builder(),
                message: `установил группу для чата по умолчанию\nГруппа: ${selectedGroup.name}\nОтделение: ${selectedGroup.specialty}`,
            });
        }
    },
});
