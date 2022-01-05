import utils from "./lib/utils";

import DB from "./lib/DB";
import VK from "./lib/VK";

import "./lib/VK/commands/textLoader";

(async function () {
	await DB.api.connection.asPromise();
	console.log("API DB Connected");
	await DB.vk.connection.asPromise();
	console.log("VK DB Connected");
	await utils.cache.update();
	console.log("Cache updated");

	await VK.updates.start();
	console.log("VK Polling started");
})();
