import DB from "./lib/DB";
import Cache from "./lib/Cache";
import Bots from "./Bot";
import API from "./API";

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
    await API.listen({
        port: DB.config.server.port,
        host: "0.0.0.0"
    });
    console.log("API started");
    console.log("MPT Assistant successfully started");
})();
