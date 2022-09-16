import DB from "./lib/DB";
import utils from "./lib/utils";

void (async function main(): Promise<void> {
    await DB.init();
    console.log(await utils.mpt.findGroup("би50-3-19"));
})();
