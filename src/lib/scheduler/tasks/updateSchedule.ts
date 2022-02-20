import path from "path";
import { Interval } from "simple-scheduler-task";
import utils from "../../utils";

export default new Interval({
	cron: "0 */12 * * *",
	source: async () => {
		return await utils.mpt.updateSchedule();
	},
	onDone: () => {
		utils.events.emit("text_log", "Расписание обновлено");
	},
	onError: (err) => {
		utils.events.emit(
			"text_log",
			`Ошибка при обновлении расписания (${err.message})`,
		);
	},
	type: path.parse(__filename).name,
});
