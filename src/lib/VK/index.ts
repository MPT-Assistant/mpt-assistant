import { VK } from "vk-io";

import DB from "../DB";

const vk = new VK({
	token: DB.config.vk.group.token,
	pollingGroupId: DB.config.vk.group.id,
});

vk.updates.on("message_new", (ctx) => console.log(ctx));

export default vk;
