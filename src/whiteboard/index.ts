import { SocketMiddleware } from '@/socket';
import { ListMemoryStore } from '@/util/memoryStore';
import { getValidatedRoom } from '@/util/room';

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
        const room = getValidatedRoom(socket.data.room);
        if (room) {
            paintStore.append(room, element);
            socket.broadcast.to(room.toString()).emit('paint', element);
        }
    });

    socket.on('remove-paint', (id: DrawElementIdentifer) => {
        const room = getValidatedRoom(socket.data.room);
        if (room) {
            paintStore.remove(room,
                (value) => value.id !== id);
            socket.broadcast.to(room.toString()).emit('remove-paint', id);
        }
    });

    socket.on('clear-paints', () => {
        const room = getValidatedRoom(socket.data.room);
        if (room) {
            paintStore.save(room, []);
            socket.broadcast.to(room.toString()).emit('clear-paints');
        }
    });

    socket.on('select-paints', (room: number, callback) => {
        if (room) {
            callback(paintStore.find(room));
        }
    });
}
