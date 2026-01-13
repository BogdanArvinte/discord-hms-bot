import { ChannelType, ThreadAutoArchiveDuration, Message } from "discord.js";

/**
 * Given a message, create a new thread for each media item it contains and
 * move the message to the appropriate thread.
 *
 * @param {Message} message - The message containing media items to be
 *   separated into threads.
 */
export async function moveToThread(message) {
  if (message.channel.type !== ChannelType.GuildText) return;
  if (!message.author.bot) return;

  message.embeds.forEach(async (embed) => {
    const mediaTitle = embed?.title?.split("-")?.slice(0, -1)?.join("-")?.trim();

    if (!mediaTitle) return;

    const thread = await message.channel.threads.cache.find((t) => t.name === mediaTitle);
    const nonce = Date.now().toString();

    if (!thread) {
      const newThread = await message.channel.threads.create({
        name: mediaTitle,
        reason: `Group content related to ${mediaTitle}`,
        autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
      });

      await newThread.send({ content: message.content, embeds: message.embeds, nonce });
    } else {
      await thread.send({ content: message.content, embeds: message.embeds, nonce });
    }

    await message.delete();
  });
}
