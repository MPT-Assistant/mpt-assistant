import moment from "moment";
import { getRandomId } from "vk-io";
import { EventEmitter } from "events";
import { ExtractDoc } from "ts-mongoose";

import DB from "../DB";
import VK from "../VK";

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
	on(event: "text_log", listener: (value: string) => void): this;

	emit(
		event: "new_replacement",
		replacement: ExtractDoc<typeof DB.api.schemes.replacementSchema>,
	): boolean;
	emit(event: "text_log", value: string): boolean;
}

class UtilsEventEmitter extends EventEmitter {
	private async _textLogHandler(value: string): Promise<void> {
		const message = `${moment().format("HH:mm:ss, DD.MM.YYYY")} - ${value}`;
		await VK.api.messages.send({
			chat_id: DB.config.vk.logs,
			random_id: getRandomId(),
			message,
		});
	}

	public bindHandlers(): void {
		this.on("new_replacement", vkUtils.onNewReplacement);
		this.on("new_replacement", telegramUtils.onNewReplacement);
		this.on("new_replacement", discordUtils.onNewReplacement);
		this.on("text_log", this._textLogHandler);
	}
}

export default UtilsEventEmitter;
