import { Telegram } from "puregram";

import DB from "../DB";

const telegram = new Telegram(DB.config.telegram);

export default telegram;
