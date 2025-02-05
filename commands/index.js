import { REST, Routes } from "discord.js";
import RequestCommand from "./request.js";

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

export const registerCommands = async (botId, guildId) => {
  try {
    await rest.put(Routes.applicationGuildCommands(botId, guildId), {
      body: [RequestCommand.data],
    });
  } catch (error) {
    console.error(error);
  }
};
