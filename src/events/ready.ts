import process from 'node:process';
import type { Client, Message, TextChannel, Collection } from 'discord.js';
import { Events } from 'discord.js';
import type { Event } from './index.js';
import { TWENTY_FOUR_HOURS } from './common.js';
import { expireMessageAfter } from './common.js';
import logger from '../logger.js';

export default {
	name: Events.ClientReady,
	once: true,
	async execute(client: Client) {
		const channel: TextChannel | null = (await client.channels.fetch(process.env.CHANNEL_ID!)) as TextChannel;
		if (channel === null) {
			return;
		}

		const bulkDeletable: Message<boolean>[] = [];

		// Discord doesn't let us fetch all of the messages at once: it paginates it.
		// Since Discord.js doesn't handle that pagination natively, we have to build
		// that pagination ourselves.

		// Fetch the latest message
		const latestMessage = await channel.messages
			.fetch({ limit: 1 })
			.then((messagePage) => (messagePage.size === 1 ? messagePage.at(0) : null));

		if (latestMessage === null || latestMessage === undefined) {
			return;
		}

		// To avoid rate limiting, we artificially insert a 5 second delay between
		// deletions.
		const delayIfExpired = 5000;

		let currentMsgPointer: Message<boolean> | null | undefined = latestMessage;
		while (currentMsgPointer) {
			// Get the 100 messages before the pointer
			let messagePage: Collection<string, Message<true>> = await channel.messages.fetch({
				limit: 100,
				before: currentMsgPointer.id,
			});

			// Check each to see if they're expired.
			for (const message of messagePage.values()) {
				const expectedExpireTimestamp = message.createdTimestamp + TWENTY_FOUR_HOURS;
				const now = Date.now();
				if (message.pinned) {
					continue;
				} else if (message.bulkDeletable) {
					// Prefer to minimize calls to the Discord API to avoid
					// rate limiting. Instead, call bulk delete once with
					// eligible messages.

					// Only delete expirable messages, though!
					if (expectedExpireTimestamp <= now) {
						bulkDeletable.push(message);
					}

					continue;
				}

				let timeout = delayIfExpired;

				// If we've found a message that should expire in the future, create an expiration for it.
				if (expectedExpireTimestamp > now) {
					timeout = expectedExpireTimestamp - now;
				}

				await expireMessageAfter(message, timeout);
			}

			// Update our message pointer to be the last message on the page of messages
			currentMsgPointer = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
		}

		await channel
			.bulkDelete(bulkDeletable)
			.then((messages) => logger.info(`Bulk deleted ${messages.size} messages.`))
			.catch((err) => logger.error(err));

		const scheduledExpiration = Date.now() - (latestMessage.createdTimestamp + TWENTY_FOUR_HOURS);
		expireMessageAfter(latestMessage, Math.max(scheduledExpiration, 0));
	},
} satisfies Event<Events.ClientReady>;
