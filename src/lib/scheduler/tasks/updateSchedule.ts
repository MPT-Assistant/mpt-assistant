import path from "path";
import { Interval } from "simple-scheduler-task";
import utils from "../../utils";

export default new Interval({
	cron: "0 */12 * * *",
	source: async () => {
		return await utils.mpt.updateSchedule();
	},
	onError: console.log,
	type: path.parse(__filename).name,
});
