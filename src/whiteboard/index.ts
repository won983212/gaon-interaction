import { SocketMiddleware } from '@/socket';
import { ListMemoryStore } from '@/util/memoryStore';

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
        if (socket.data.room) {
            paintStore.append(socket.data.room, element);
            socket.broadcast.to(socket.data.room).emit('paint', element);
        }
    });

    socket.on('remove-paint', (id: DrawElementIdentifer) => {
        if (socket.data.room) {
            paintStore.remove(socket.data.room,
                (value) => value.id !== id);
            socket.broadcast.to(socket.data.room).emit('remove-paint', id);
        }
    });

    socket.on('clear-paints', (id: DrawElementIdentifer) => {
        if (socket.data.room) {
            paintStore.save(socket.data.room, []);
            socket.broadcast.to(socket.data.room).emit('clear-paints');
        }
    });

    socket.on('select-paints', (room, callback) => {
        if (room) {
            callback(paintStore.find(room));
        }
    });
}
