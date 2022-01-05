import { VK } from "vk-io";

import DB from "../DB";

import messageNew from "./handlers/messageNew";
import messageEvent from "./handlers/messageEvent";

const vk = new VK(DB.config.vk.group);

vk.updates.on("message_new", messageNew);
vk.updates.on("message_event", messageEvent);

export default vk;
