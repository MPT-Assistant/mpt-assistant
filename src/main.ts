import DB from "./lib/DB";
import Cache from "./lib/Cache";
import Bots from "./Bot";

import "./lib/tasks";

void (async function main(): Promise<void> {
    await DB.init();
    console.log("DB connected");
    await Cache.load();
    console.log("Cache loaded");
    await Cache.update();
    console.log("Cache updated");
    await Bots.start();
    console.log("Bots polling started");
    console.log("MPT Assistant successfully started");
})();
