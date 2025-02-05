import { Client, Events, GatewayIntentBits } from "discord.js";
import { moveToThread } from "./actions/threads.js";
import { registerCommands } from "./commands/index.js";
import RequestCommand from "./commands/request.js";

const { DISCORD_TOKEN } = process.env;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag} - ${readyClient.user.id}`);
  registerCommands(readyClient.user.id, readyClient.guilds.cache.first().id);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.commandName === "request") {
    if (interaction.isAutocomplete()) await RequestCommand.autocomplete(interaction);
    if (interaction.isChatInputCommand()) await RequestCommand.execute(interaction);
  }
});

client.on("messageCreate", async (message) => {
  await moveToThread(message);
});

client.login(DISCORD_TOKEN);
