import path from "node:path";
import { Interval } from "@rus-anonym/scheduler";

import utils from "../../utils";

export default new Interval({
    cron: "0 */12 * * *",
    source: async (): Promise<void> => {
        return await utils.mpt.updateSchedule();
    },
    type: path.parse(__filename).name,
});
