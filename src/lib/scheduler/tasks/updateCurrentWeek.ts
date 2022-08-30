import path from "path";
import { Interval } from "@rus-anonym/scheduler";
import utils from "../../utils";

export default new Interval({
	cron: "*/30 * * * *",
	source: async () => {
		return await utils.cache.updateWeek();
	},
	type: path.parse(__filename).name,
});
