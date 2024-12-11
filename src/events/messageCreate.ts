import process from 'node:process';
import type { Message } from 'discord.js';
import { Events } from 'discord.js';
import logger from '../logger.js';
import { TWENTY_FOUR_HOURS } from './common.js';
import type { Event } from './index.js';
import { MessageItem } from '../model/messageItem.js';

export default {
	name: Events.MessageCreate,
	once: false,
	async execute(message: Message) {
		if (message.guildId !== process.env.GUILD_ID! || message.channelId !== process.env.CHANNEL_ID!) {
			console.log('Received a message not belonging to the expected server & channel.');
			return;
		}

		logger.info(`Message received: ${message.id}`);
		messageQueue.push(new MessageItem(message, TWENTY_FOUR_HOURS));
	},
} satisfies Event<Events.MessageCreate>;
