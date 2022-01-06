import { Telegram } from "puregram";
import { PromptManager } from "@puregram/prompt";

import DB from "../DB";

import messageHandler from "./handlers/message";
import callbackQueryHandler from "./handlers/callbackQuery";

const telegram = new Telegram(DB.config.telegram);
const promptManager = new PromptManager();

telegram.updates.use(promptManager.middleware);
telegram.updates.on("message", messageHandler);
telegram.updates.on("callback_query", callbackQueryHandler);

export default telegram;
