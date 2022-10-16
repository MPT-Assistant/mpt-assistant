import path from "node:path";
import { Interval } from "@rus-anonym/scheduler";

import Cache from "../../Cache";

export default new Interval({
    cron: "0 */12 * * *",
    source: async (): Promise<void> => {
        return await Cache.update();
    },
    type: path.parse(__filename).name,
});
