import moment from "moment";
import { getRandomId } from "vk-io";
import { EventEmitter } from "events";
import { ExtractDoc } from "ts-mongoose";

import DB from "../DB";
import VK from "../VK";

import vkUtils from "../VK/utils/index";
import telegramUtils from "../Telegram/utils/index";
import discordUtils from "../Discord/utils/index";
import CoreError from "./Error";

interface UtilsEventEmitter {
	on(
		event: "new_replacement",
		listener: (
			replacement: ExtractDoc<typeof DB.api.schemes.replacementSchema>,
		) => void,
	): this;
	on(event: "text_log", listener: (value: string) => void): this;
	on(event: "core_error", listener: (err: CoreError<0, object>) => void): this;

	emit(
		event: "new_replacement",
		replacement: ExtractDoc<typeof DB.api.schemes.replacementSchema>,
	): boolean;
	emit(event: "text_log", value: string): boolean;
	emit(event: "core_error", err: CoreError<0, object>): boolean;
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

	private async _errorHandler(err: CoreError<0, object>): Promise<void> {
		const message = `${err.toString()}
Date: ${moment().format("HH:mm:ss, DD.MM.YYYY")}
Meta: ${JSON.stringify(err.meta, null, "\t")}

Cause: ${err.cause.name}
	Message: ${err.cause.message}
	Stack: ${err.cause.stack}`;

		const document = await VK.upload.messageDocument({
			peer_id: 2e9 + DB.config.vk.logs,
			source: {
				value: Buffer.from(message),
				filename: "error.txt",
				contentType: "text/html",
			},
			title: `Error #${err.code}`,
		});

		await VK.api.messages.send({
			chat_id: DB.config.vk.logs,
			random_id: getRandomId(),
			attachment: document.toString(),
		});
	}

	public bindHandlers(): void {
		this.on("new_replacement", vkUtils.onNewReplacement);
		this.on("new_replacement", telegramUtils.onNewReplacement);
		this.on("new_replacement", discordUtils.onNewReplacement);
		this.on("text_log", this._textLogHandler);
		this.on("core_error", this._errorHandler);
	}
}

export default UtilsEventEmitter;
