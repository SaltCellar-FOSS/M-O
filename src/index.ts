import process from 'node:process';
import { URL } from 'node:url';
import { Client, GatewayIntentBits } from 'discord.js';
import { MessageItem } from './model/messageItem.js';
import { loadCommands, loadEvents } from './util/loaders.js';
import { registerEvents } from './util/registerEvents.js';
import { set } from 'zod';
import { expireMessages } from './events/common.js';

declare global {
    let messageQueue: Array<MessageItem>;
}

// Initialize the client
const client = new Client({ intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds] });

// Load the events and commands
const events = await loadEvents(new URL('events/', import.meta.url));
const commands = await loadCommands(new URL('commands/', import.meta.url));

// Register the event handlers
registerEvents(commands, events, client);

messageQueue = new Array<MessageItem>();

client.once('ready', async (client : Client) => {
    setInterval(() => {
        expireMessages(client);
    }, 1000);
});

// Login to the client
void client.login(process.env.DISCORD_TOKEN);
