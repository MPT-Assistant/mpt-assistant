import { Telegram } from "puregram";

import DB from "../DB";

import messageHandler from "./handlers/message";
import callbackQueryHandler from "./handlers/callbackQuery";

const telegram = new Telegram(DB.config.telegram);

telegram.updates.on("message", messageHandler);
telegram.updates.on("callback_query", callbackQueryHandler);

export default telegram;
