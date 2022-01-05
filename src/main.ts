import utils from "./lib/utils";
import DB from "./lib/DB";

(async function () {
	await DB.api.connection.asPromise();
	console.log("API DB Connected");
	await DB.vk.connection.asPromise();
	console.log("VK DB Connected");
	await utils.cache.update();
	console.log("Cache updated");
})();
