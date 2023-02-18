import path from "node:path";
import { Interval } from "@rus-anonym/scheduler";

import Cache from "../../Cache";

export default new Interval({
    cron: "*/5 * * * *",
    source: Cache.update.bind(Cache),
    type: path.parse(__filename).name,
});
