import { typedModel } from "ts-mongoose";
import DB from "./DB";

import schemes from "./schemes/api";

class API extends DB {
	public readonly schemes = schemes;
	public readonly models = {
		specialty: typedModel(
			"specialty",
			schemes.specialtySchema,
			"specialties",
			undefined,
			undefined,
			this.connection,
		),
		group: typedModel(
			"group",
			schemes.groupSchema,
			"groups",
			undefined,
			undefined,
			this.connection,
		),
		replacement: typedModel(
			"replacement",
			schemes.replacementSchema,
			"replacements",
			undefined,
			undefined,
			this.connection,
		),
	};
}

export default API;
