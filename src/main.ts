import utils from "./lib/utils";

import DB from "./lib/DB";
import VK from "./lib/VK";

import "./lib/VK/commands/textLoader";
import "./lib/VK/commands/eventLoader";

(async function () {
	await DB.api.connection.asPromise();
	console.log("API DB connected");
	await DB.vk.connection.asPromise();
	console.log("VK DB connected");
	await DB.telegram.connection.asPromise();
	console.log("Telegram DB connected");
	await utils.cache.update();
	console.log("Cache updated");

	await VK.updates.start();
	console.log("VK Polling started");
})();
