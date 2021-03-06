import path from "path";
import { Interval } from "simple-scheduler-task";
import utils from "../../utils";

export default new Interval({
	cron: "*/30 * * * *",
	source: async () => {
		return await utils.cache.updateWeek();
	},
	type: path.parse(__filename).name,
});
