import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlagsBitField } from "discord.js";
import { getTypeSuggestions, getTitleSuggestions } from "../actions/request.js";
import { addMedia } from "../services/index.js";

let isAutocompleteInProgress = false;

export default {
  data: new SlashCommandBuilder()
    .setName("request")
    .setDescription("Request new media")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Type of the media")
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("Title of the media")
        .setAutocomplete(true)
        .setRequired(true)
    ),
  /**
   * Responds to the `/request` command by sending a message back to the user
   * saying "Request sent!".
   *
   * @param {ChatInputCommandInteraction} interaction - The interaction object.
   */
  async execute(interaction) {
    const type = interaction.options.getString("type");
    const id = interaction.options.getString("title");

    try {
      const media = await addMedia(type, id);
      if (media) {
        await interaction.reply({
          content: `"${media}" added successfully! Stay tuned for updates.`,
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: "Failed to request media. Please try again later.",
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "Failed to request media. Please try again later.",
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
    }
  },
  /**
   * This function is called when the user is filling out the options for
   * the `/request` command. It is called whenever the user types a character
   * in the options.
   *
   * @param {ChatInputCommandInteraction} interaction - The interaction object.
   *
   * @returns {Promise<void>} The function does not return any value.
   */
  async autocomplete(interaction) {
    if (isAutocompleteInProgress || !interaction) return;

    const focused = interaction.options.getFocused(true);
    const channel = interaction.channel.name;

    if (focused.name === "type") {
      isAutocompleteInProgress = true;
      const suggestions = getTypeSuggestions(channel, focused.value);
      await interaction.respond(suggestions);
      isAutocompleteInProgress = false;
    }

    if (focused.name === "title") {
      isAutocompleteInProgress = true;

      if (focused.value.length < 3) {
        await interaction.respond([]);
        isAutocompleteInProgress = false;
        return;
      }

      const type = interaction.options.getString("type");
      const suggestions = await getTitleSuggestions(type, focused.value);

      await interaction.respond(suggestions);
      isAutocompleteInProgress = false;
    }
  },
};
