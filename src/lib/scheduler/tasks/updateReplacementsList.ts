import path from "path";
import { Interval } from "simple-scheduler-task";
import utils from "../../utils";

export default new Interval({
	cron: "*/5 * * * *",
	source: utils.mpt.updateReplacementsList,
	type: path.parse(__filename).name,
});
