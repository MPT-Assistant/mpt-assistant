import { Client, Intents } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

import DB from "../DB";

const commands = [
	{
		name: "ping",
		description: "Replies with Pong!",
	},
];

const rest = new REST({ version: "9" }).setToken(DB.config.discord.token);

(async () => {
	try {
		console.log("Started refreshing application (/) commands.");

		await rest.put(Routes.applicationCommands(DB.config.discord.id), {
			body: commands,
		});

		console.log("Successfully reloaded application (/) commands.");
	} catch (error) {
		console.error(error);
	}
})();

const discordClient = new Client({ intents: [Intents.FLAGS.GUILDS] });
discordClient.token = DB.config.discord.token;

discordClient.on("interactionCreate", async (interaction) => {
	if (!interaction.isCommand()) return;

	if (interaction.commandName === "ping") {
		await interaction.reply("Pong!");
	}
});

export default discordClient;
