import path from "path";
import { Interval } from "@rus-anonym/scheduler";
import utils from "../../utils";

export default new Interval({
	cron: "*/5 * * * *",
	source: async () => {
		return await utils.mpt.updateReplacementsList();
	},
	type: path.parse(__filename).name,
});
