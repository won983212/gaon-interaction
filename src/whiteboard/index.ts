import { SocketMiddleware } from '@/socket';
import { ListMemoryStore } from '@/util/memoryStore';
import { getValidatedRoom } from '@/util/room';
import logger from '@/logger';

export type DrawElementIdentifer = string;
export type DrawElementType = 'path' | 'line' | 'circle' | 'rectangle' | 'text';

export interface BrushStyle {
    strokeStyle: string;
    fillStyle: string;
    thickness: number;
}

export interface SerializedDrawElement {
    id: DrawElementIdentifer;
    type: DrawElementType;
    style: BrushStyle;
    data: any;
}

const paintStore = new ListMemoryStore<SerializedDrawElement>();

export default function Whiteboard({ socket }: SocketMiddleware) {
    socket.on('paint', (element) => {
        try {
            const room = getValidatedRoom(socket.data.room);
            if (room) {
                paintStore.append(room, element);
                socket.broadcast.to(room.toString()).emit('paint', element);
            }
        } catch (e) {
            logger.error(e);
        }
    });

    socket.on('remove-paint', (id: DrawElementIdentifer) => {
        try {
            const room = getValidatedRoom(socket.data.room);
            if (room) {
                paintStore.remove(room, (value) => value.id !== id);
                socket.broadcast.to(room.toString()).emit('remove-paint', id);
            }
        } catch (e) {
            logger.error(e);
        }
    });

    socket.on('clear-paints', () => {
        try {
            const room = getValidatedRoom(socket.data.room);
            if (room) {
                paintStore.save(room, []);
                socket.broadcast.to(room.toString()).emit('clear-paints');
            }
        } catch (e) {
            logger.error(e);
        }
    });

    socket.on('select-paints', (room: number, callback) => {
        try {
            if (room) {
                callback(paintStore.find(room));
                return;
            }
        } catch (e) {
            logger.error(e);
        } finally {
            callback([]);
        }
    });
}
