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
	await Promise.all([
		DB.api.connection.asPromise(),
		DB.vk.connection.asPromise(),
		DB.telegram.connection.asPromise(),
		DB.discord.connection.asPromise(),
	]);

	console.log("DB connected");

	await VK.updates.start();
	console.log("VK polling started");
	await Telegram.updates.startPolling();
	console.log("Telegram polling started");
	await Discord.publishHints();
	await Discord.client.login();
	console.log("Discord polling started");
})();
