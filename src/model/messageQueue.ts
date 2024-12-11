import type { MessageItem } from './messageItem.js';

export class MessageQueue {
	public _queue: MessageItem[];

	public constructor() {
		this._queue = new Array<MessageItem>();
	}

	public addToQueue(messageToAdd: MessageItem): void {
		if (!this._queue.some((msg) => msg.messageId === messageToAdd.messageId)) {
			this._queue.push(messageToAdd);
		}
	}

	public snapshot(): MessageItem[] {
		return this._queue.slice();
	}

	public clearQueue(): void {
		this._queue = [];
	}
}
