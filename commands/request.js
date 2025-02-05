import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlagsBitField } from "discord.js";

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
      option.setName("title").setDescription("Title of the media").setRequired(true)
    ),
  /**
   * Responds to the `/request` command by sending a message back to the user
   * saying "Request sent!".
   *
   * @param {ChatInputCommandInteraction} interaction - The interaction object.
   */
  async execute(interaction) {
    await interaction.reply({
      content: "Not yet implemented. Stay tuned!",
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });
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
    const focusedValue = interaction.options.getFocused();
    const channel = interaction.channel.name;

    const choices = [
      { name: "Movie", value: "movie" },
      { name: "TV Show", value: "tv" },
      { name: "Music", value: "music" },
    ];

    const index = choices.findIndex((c) => c.value === channel);

    if (index !== -1) {
      const matched = choices.splice(index, 1)[0];
      choices.unshift(matched);
    }

    const filtered = choices.filter(
      (choice) =>
        choice.name.toLowerCase().startsWith(focusedValue.toLowerCase()) ||
        choice.name.toLowerCase().includes(focusedValue.toLowerCase())
    );

    await interaction.respond(filtered);
  },
};
