import { SocketMiddleware } from '@/socket';
import { MemoryStore } from '@/util/memoryStore';

export interface CodeChange {
    rangeOffset: number;
    rangeLength: number;
    text: string;
}

const codeStore = new MemoryStore<string>('');

export default function CodeShare({
    namespace,
    socket,
    user
}: SocketMiddleware) {
    socket.on('update-code', (changes: CodeChange[]) => {
        console.log(changes); // TODO update된 code 반영
    });

    socket.on('select-code', (room, callback) => {
        if (room) {
            callback(codeStore.find(room));
        }
    });
}
