import { EventEmitter } from "events";
import { ExtractDoc } from "ts-mongoose";

import DB from "../DB";

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

class UtilsEventEmitter extends EventEmitter {}

export default UtilsEventEmitter;
