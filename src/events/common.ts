/* eslint-disable promise/prefer-await-to-then */
import process from 'node:process';
import { setTimeout } from 'node:timers/promises';
import type { Message, Client, TextChannel } from 'discord.js';
import logger from '../logger.js';
import type { MessageItem } from '../model/messageItem.js';

export const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1_000;
export const FIVE_MINUTES = 5 * 60 * 1_000;
export const FIVE_SECONDS = 5 * 1_000;

const expireMessage = async (message: Message) =>
	message
		.delete()
		.then((deletedMsg) => {
			logger.info(`Deleted message ${deletedMsg.id} successfully.`);
		})
		.catch((error) => {
			logger.error(`Error expiring ${message.id}:`);
			logger.error(error);
		});

export const expireMessages = async (client: Client): Promise<void> => {
	const messageQueueSnapshot: MessageItem[] = globalThis.messageQueue.snapshot();
	globalThis.messageQueue.clearQueue();
	const bulkDeletable: Message[] = [];
	const undeletedMessages: MessageItem[] = [];
	while (messageQueueSnapshot.length !== 0) {
		const message = messageQueueSnapshot.shift();
		if (message === undefined) {
			continue;
		}

		try {
			if (await message.shouldDelete()) {
				if (message.message.bulkDeletable) {
					bulkDeletable.push(message.message);
				} else {
					await expireMessage(message.message);
					// if we're deleting one by one, wait so that we don't get rate limited.
					await setTimeout(FIVE_SECONDS);
				}
			} else {
				undeletedMessages.push(message);
			}
		} catch (error: any) {
			logger.error(error);
			undeletedMessages.push(message);
		}
	}

	const channel = (await client.channels.fetch(process.env.CHANNEL_ID!)) as TextChannel;

	channel
		.bulkDelete(bulkDeletable)
		.then((messages) => logger.info(`Bulk deleted ${messages.size} messages.`))
		.catch((error) => logger.error(error));

	for (const msg of undeletedMessages) global.messageQueue.addToQueue(msg);
};
