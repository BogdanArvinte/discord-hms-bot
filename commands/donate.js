import { SlashCommandBuilder, EmbedBuilder, MessageFlagsBitField } from "discord.js";

const { BUY_ME_A_COFFEE_URL, BUY_ME_A_COFFEE_ICON } = process.env;

export default {
  data: new SlashCommandBuilder()
    .setName("donate")
    .setDescription("You can Buy Me A Coffee if you want to support me 😊."),

  async execute(interaction) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xffdd00)
          .setAuthor({
            name: "Buy Me a Coffee",
            iconURL: BUY_ME_A_COFFEE_ICON,
            url: BUY_ME_A_COFFEE_URL,
          })
          .setTitle("mArv")
          .setURL(BUY_ME_A_COFFEE_URL)
          .setThumbnail(BUY_ME_A_COFFEE_ICON)
          .setDescription(
            `Visit my profile to see how you can support me 🤗.\n☕ ${BUY_ME_A_COFFEE_URL}`
          ),
      ],
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });
  },
};
