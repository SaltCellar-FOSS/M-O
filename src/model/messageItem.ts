import { Message } from 'discord.js';

export class MessageItem {
    message: Message;
    timestamp: Date;
    deleteAfterMs: number;

    constructor(message: Message, deleteAfterMs: number) {
        this.message = message;
        this.timestamp = new Date();
        this.deleteAfterMs = deleteAfterMs;
    }

    shouldDelete(): boolean {
        const now = new Date().getTime();
        const timeAdded = this.timestamp.getTime();
        const refreshedMessage = this.message.fetch(true);
        return (now - timeAdded >= this.deleteAfterMs) && !refreshedMessage.pinned;
    }
}
