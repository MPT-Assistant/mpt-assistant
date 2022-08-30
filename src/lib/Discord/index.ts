import { Client } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

import DB from "../DB";

import discordUtils from "./utils";

import interactionCreateHandler from "./handlers/interactionCreate";

const client = new Client({ intents: ["GUILDS"] });
client.token = DB.config.discord.token;

client.on("interactionCreate", interactionCreateHandler);

const publishHints = (): Promise<unknown> => {
	const rest = new REST({ version: "9" }).setToken(DB.config.discord.token);

	return rest.put(Routes.applicationCommands(DB.config.discord.id), {
		body: discordUtils.textCommands.map((x) => x.toJSON()),
	});
};

export default { publishHints, client };
