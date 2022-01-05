import { VK } from "vk-io";

import DB from "../DB";

import messageNew from "./handlers/messageNew";

const vk = new VK({
	token: DB.config.vk.group.token,
	pollingGroupId: DB.config.vk.group.id,
});

vk.updates.on("message_new", messageNew);

export default vk;
