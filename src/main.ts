import DB from "./lib/DB";
import Cache from "./lib/Cache";
import utils from "./lib/utils";

void (async function main(): Promise<void> {
    await DB.init();
    await Cache.load();
    const group = await utils.mpt.getExtendGroupInfo("БИ50-3-19");
    const schedule = await utils.mpt.getGroupSchedule(group.group);
    console.log(schedule);
})();
