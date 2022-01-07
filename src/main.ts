import DB from "./lib/DB";
import VK from "./lib/VK";
import Telegram from "./lib/Telegram";
import Discord from "./lib/Discord";

import "./lib/VK/commands/textLoader";
import "./lib/VK/commands/eventLoader";

import "./lib/Telegram/commands/textLoader";
import "./lib/Telegram/commands/callbackLoader";

import "./lib/Discord/commands/textLoader";
import "./lib/Discord/commands/callbackLoader";

(async function () {
	await DB.api.connection.asPromise();
	console.log("API DB connected");
	await DB.vk.connection.asPromise();
	console.log("VK DB connected");
	await DB.telegram.connection.asPromise();
	console.log("Telegram DB connected");
	await DB.discord.connection.asPromise();
	console.log("Discord DB connected");

	await VK.updates.start();
	console.log("VK polling started");
	await Telegram.updates.startPolling();
	console.log("Telegram polling started");
	await Discord.publishHints();
	await Discord.client.login();
	console.log("Discord polling started");
})();
