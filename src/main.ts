import DB from "./lib/DB";
import Cache from "./lib/Cache";

import "./lib/tasks";

void (async function main(): Promise<void> {
    await DB.init();
    console.log("DB connected");
    await Cache.load();
    console.log("Cache loaded");
    await Cache.update();
    console.log("Cache updated");
    console.log("MPT Assistant successfully started");
})();
