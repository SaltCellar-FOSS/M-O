import { Message } from 'discord.js';

import { setTimeout } from 'timers/promises';
import logger from '../logger.js';

export const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export const expireMessageAfter = async (message: Message, millis: number): Promise<void> => {
	if (message.pinned) {
		return setTimeout(0);
	}

	await setTimeout(millis);
	const refreshedMessage = await message.fetch(true);
	return expireMessage(refreshedMessage);
};

export const expireMessage = (message: Message<boolean>) =>
	message
		.delete()
		.then((deletedMsg) => {
			logger.info(`Deleted message ${deletedMsg.id} successfully.`);
		})
		.catch((err) => {
			logger.error(`Error expiring ${message.id}:`);
			logger.error(err);
		});
