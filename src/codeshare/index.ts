import { SocketMiddleware } from '@/socket';
import { MemoryStore } from '@/util/memoryStore';
import logger from '@/logger';

export interface CodeChange {
    rangeOffset: number;
    rangeLength: number;
    text: string;
}

const codeStore = new MemoryStore<string>('');

export default function CodeShare({ socket }: SocketMiddleware) {
    socket.on('update-code', (changes: CodeChange[]) => {
        try {
            console.log(changes); // TODO update된 code 반영
        } catch (e) {
            logger.error(e);
        }
    });

    socket.on('select-code', (room: number, callback) => {
        try {
            if (room) {
                callback(codeStore.find(room));
                return;
            }
        } catch (e) {
            logger.error(e);
        } finally {
            callback([]);
        }
    });
}
