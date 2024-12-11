import type { MessageQueue } from './model/messageQueue.js';

declare global {
	// eslint-disable-next-line vars-on-top, no-var
	var messageQueue: MessageQueue;
}
