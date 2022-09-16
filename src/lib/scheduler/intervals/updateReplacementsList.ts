import path from "node:path";
import { Interval } from "@rus-anonym/scheduler";

export default new Interval({
    cron: "*/5 * * * *",
    source: async (): Promise<void> => {
        return await Promise.resolve();
    },
    type: path.parse(__filename).name,
});
