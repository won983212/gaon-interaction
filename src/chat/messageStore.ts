import { UserIdentifier } from '../types';

export interface Message {
    senderId: UserIdentifier;
    message: string;
}

export default class MessageStore {
    private messages: Message[];

    constructor() {
        this.messages = [];
    }

    saveMessage(message: Message) {
        this.messages.push(message);
    }

    findMessagesForUsers(userId: string): Message[] {
        return this.messages;
    }
}
