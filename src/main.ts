import DB from "./lib/DB";

void (async function main(): Promise<void> {
    await DB.init();
    console.log((await DB.api.models.cache.find()));
})();
