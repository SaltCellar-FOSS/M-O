import type { Message } from 'discord.js';

export class MessageItem {
	public messageId: string;

	public message: Message;

	public timestamp: Date;

	public deleteAfterMs: number;

	public constructor(message: Message, deleteAfterMs: number, timestamp: Date | null = null) {
		this.messageId = message.id;
		this.message = message;
		this.timestamp = timestamp ?? new Date();
		this.deleteAfterMs = deleteAfterMs;
	}

	public async shouldDelete(): Promise<boolean> {
		const now = Date.now();
		const timeAdded = this.timestamp.getTime();
		const refreshedMessage = await this.message.fetch(true);
		this.message = refreshedMessage;
		return now - timeAdded >= this.deleteAfterMs && !this.message.pinned;
	}
}
