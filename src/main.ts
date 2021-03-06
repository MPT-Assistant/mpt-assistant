import DB from "./lib/DB";
import VK from "./lib/VK";
import Telegram from "./lib/Telegram";
import Discord from "./lib/Discord";
import server from "./lib/API";
import utils from "./lib/utils";

import "./lib/scheduler";

import "./lib/VK/commands/textLoader";
import "./lib/VK/commands/eventLoader";

import "./lib/Telegram/commands/textLoader";
import "./lib/Telegram/commands/callbackLoader";

import "./lib/Discord/commands/textLoader";
import "./lib/Discord/commands/callbackLoader";

import "./lib/API/methods/loader";

(async function () {
	utils.events.bindHandlers();
	console.log("Event handlers are bound");

	await Promise.all([
		DB.api.connection.asPromise(),
		DB.vk.connection.asPromise(),
		DB.telegram.connection.asPromise(),
		DB.discord.connection.asPromise(),
	]);
	console.log("DB connected");

	await utils.cache.load();
	console.log("Cache loaded");

	await VK.updates.start();
	console.log("VK polling started");
	await Telegram.updates.startPolling();
	console.log("Telegram polling started");
	await Discord.publishHints();
	await Discord.client.login();
	console.log("Discord polling started");

	await server.listen({
		port: 443,
		host: "0.0.0.0",
	});
	console.log("Server listening on port 443");
})();
