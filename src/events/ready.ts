import process from 'node:process';
import { setInterval } from 'node:timers';
import type { Client, Message, TextChannel, Collection } from 'discord.js';
import { Events } from 'discord.js';
import logger from '../logger.js';
import { MessageItem } from '../model/messageItem.js';
import { TEN_MINUTES, TWENTY_FOUR_HOURS, expireMessages } from './common.js';
import type { Event } from './index.js';

export default {
	name: Events.ClientReady,
	once: true,
	async execute(client: Client) {
		const channel: TextChannel | null = (await client.channels.fetch(process.env.CHANNEL_ID!)) as TextChannel;
		if (channel === null) {
			return;
		}

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

		let currentMsgPointer: Message<boolean> | null | undefined = latestMessage;
		while (currentMsgPointer) {
			// Get the 100 messages before the pointer
			const messagePage: Collection<string, Message<true>> = await channel.messages.fetch({
				limit: 100,
				before: currentMsgPointer.id,
			});

			for (const message of messagePage.values()) {
				// expireMessages will handle whether to delete in bulk, or delete one by one with 5 second delays in between.

				logger.info(`Message queued: ${message.id}`);
				globalThis.messageQueue.addToQueue(new MessageItem(message, TWENTY_FOUR_HOURS, message.createdAt));
			}

			// Update our message pointer to be the last message on the page of messages
			currentMsgPointer = messagePage.size > 0 ? messagePage.at(messagePage.size - 1) : null;
		}

		logger.info(`Message queued: ${latestMessage.id}`);
		globalThis.messageQueue.addToQueue(new MessageItem(latestMessage, TWENTY_FOUR_HOURS, latestMessage.createdAt));

		// run it once and handle the backlog.
		await expireMessages(client);

		// set the loop up.
		setInterval(async () => {
			await expireMessages(client);
		}, TEN_MINUTES);
	},
} satisfies Event<Events.ClientReady>;
