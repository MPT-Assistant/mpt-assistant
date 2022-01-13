import { EventEmitter } from "events";
import { ExtractDoc } from "ts-mongoose";

import DB from "../DB";

import vkUtils from "../VK/utils/index";
import telegramUtils from "../Telegram/utils/index";
import discordUtils from "../Discord/utils/index";

interface UtilsEventEmitter {
	on(
		event: "new_replacement",
		listener: (
			replacement: ExtractDoc<typeof DB.api.schemes.replacementSchema>,
		) => void,
	): this;

	emit(
		event: string,
		replacement: ExtractDoc<typeof DB.api.schemes.replacementSchema>,
	): boolean;
}

class UtilsEventEmitter extends EventEmitter {
	public bindHandlers(): void {
		this.on("new_replacement", vkUtils.onNewReplacement);
		this.on("new_replacement", telegramUtils.onNewReplacement);
		this.on("new_replacement", discordUtils.onNewReplacement);
	}
}

export default UtilsEventEmitter;
