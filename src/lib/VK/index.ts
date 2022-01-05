import { VK } from "vk-io";

import DB from "../DB";

import messageNew from "./handlers/messageNew";
import messageEvent from "./handlers/messageEvent";

const vk = new VK({
	token: DB.config.vk.group.token,
	pollingGroupId: DB.config.vk.group.id,
});

vk.updates.on("message_new", messageNew);
vk.updates.on("message_event", messageEvent);

export default vk;
