import DB from "./lib/DB";
import Cache from "./lib/Cache";

void (async function main(): Promise<void> {
    await DB.init();
    await Cache.load();
    console.log(Cache.week);
})();
