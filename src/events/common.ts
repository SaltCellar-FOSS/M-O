import process from 'node:process';
import { Message, Client, TextChannel } from 'discord.js';
import logger from '../logger.js';

export const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export const expireMessage = (message: Message) =>
	message
		.delete()
		.then((deletedMsg) => {
			logger.info(`Deleted message ${deletedMsg.id} successfully.`);
		})
		.catch((err) => {
			logger.error(`Error expiring ${message.id}:`);
			logger.error(err);
		});

		
export const expireMessages = async (client: Client): Promise<void> => {
	let bulkDeletable: Array<Message> = [];
	for (const message of messageQueue) {
		if (message.shouldDelete()) {
			bulkDeletable.push(message.message);
		}
	}
	
	let channel = await client.channels.fetch(process.env.CHANNEL_ID!) as TextChannel;
	
	channel.bulkDelete(bulkDeletable)
		.then((messages) => logger.info(`Bulk deleted ${messages.size} messages.`))
		.catch((err) => logger.error(err));
};
