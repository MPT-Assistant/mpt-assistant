import path from "node:path";
import { Interval } from "@rus-anonym/scheduler";

import miniapp from "../../miniapp";

export default new Interval({
    cron: "*/15 * * * *",
    source: miniapp.resetCache.bind(miniapp),
    type: path.parse(__filename).name,
});
