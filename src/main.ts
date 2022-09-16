import DB from "./lib/DB";
import Cache from "./lib/Cache";
import utils from "./lib/utils";

import "./lib/tasks";

void (async function main(): Promise<void> {
    await DB.init();
    await Cache.load();
    await utils.mpt.updateReplacementsList();
    console.log("Done");
})();
