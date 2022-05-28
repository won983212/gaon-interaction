import { IMessage } from '@/types';

export default class MessageStore {
    private messages: Map<string, IMessage[]>;

    constructor() {
        this.messages = new Map();
    }

    saveMessage(room: string, message: IMessage) {
        if (this.messages.has(room)) {
            this.messages.get(room)?.push(message);
        } else {
            this.messages.set(room, [message]);
        }
    }

    findAllMessages(room: string): IMessage[] {
        if (this.messages.has(room)) {
            return this.messages.get(room) as IMessage[];
        }
        return [];
    }
}
