import { Telegram } from "puregram";

import DB from "../DB";

import messageHandler from "./handlers/message";

const telegram = new Telegram(DB.config.telegram);

telegram.updates.on("message", messageHandler);

export default telegram;
