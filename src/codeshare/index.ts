import { SocketMiddleware } from '@/socket';
import { MemoryStore } from '@/util/memoryStore';
import logger from '@/logger';
import { getValidatedRoom } from '@/util/room';

export interface CodeChange {
    rangeOffset: number;
    rangeLength: number;
    text: string;
}

const defaultLang = 'javascript';
const codeLangStore = new MemoryStore<string>(defaultLang);

export default function CodeShare({ socket }: SocketMiddleware) {
    socket.on('update-lang', (lang: string) => {
        try {
            const room = getValidatedRoom(socket.data.room);
            if (room) {
                codeLangStore.save(room, lang);
                socket.broadcast.to(room.toString()).emit('update-lang', lang);
                console.log(`Updated language of ${room} to ${lang}`);
            }
        } catch (e) {
            logger.error(e);
        }
    });

    socket.on('select-lang', (room: number, callback) => {
        try {
            if (room) {
                callback(codeLangStore.find(room));
                return;
            }
        } catch (e) {
            logger.error(e);
        } finally {
            callback(defaultLang);
        }
    });
}
