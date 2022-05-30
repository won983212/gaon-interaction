import { SocketMiddleware } from '@/socket';
import { ListMemoryStore } from '@/util/memoryStore';

const paintStore = new ListMemoryStore<SerializedDrawElement>();

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
}

export default function Whiteboard({
    namespace,
    socket,
    user
}: SocketMiddleware) {
    socket.on('append-paint', (element: SerializedDrawElement) => {
        console.log(element); // TODO 새로운 paint추가
    });

    socket.on('remove-paint', (element: SerializedDrawElement) => {
        console.log(element); // TODO paint 삭제
    });

    socket.on('select-paints', (room, callback) => {
        if (room) {
            callback(paintStore.find(room));
        }
    });
}
