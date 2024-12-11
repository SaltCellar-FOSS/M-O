import process from 'node:process';
import { URL } from 'node:url';
import { Client, GatewayIntentBits } from 'discord.js';
import { MessageQueue } from './model/messageQueue.js';
import { loadCommands, loadEvents } from './util/loaders.js';
import { registerEvents } from './util/registerEvents.js';

import './globals.js';

// Initialize the client
const client = new Client({ intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds] });

// Load the events and commands
const events = await loadEvents(new URL('events/', import.meta.url));
const commands = await loadCommands(new URL('commands/', import.meta.url));

// Register the event handlers
registerEvents(commands, events, client);

globalThis.messageQueue = new MessageQueue();

// Login to the client
void client.login(process.env.DISCORD_TOKEN);
