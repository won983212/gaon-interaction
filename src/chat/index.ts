import { SocketMiddleware } from '@/socket';
import { IMessage } from '@/types';
import dayjs from 'dayjs';
import logger from '@/logger';
import { ListMemoryStore } from '@/util/memoryStore';
import { getValidatedRoom } from '@/util/room';

const messageStore = new ListMemoryStore<IMessage>();

export default function Chat({ namespace, socket, user }: SocketMiddleware) {
    socket.on('message', (message: string) => {
        const msg: IMessage = {
            sender: user.username,
            message: message,
            date: dayjs().unix()
        };
        
        const room = getValidatedRoom(socket.data.room);
        if (room && message) {
            logger.info(
                `[Chat-${socket.data.room}] ${msg.sender}: ${msg.message}`
            );
            messageStore.append(room, msg);
            namespace.to(room.toString()).emit('message', msg);
        }
    });

    socket.on('select-messages', (room: number, callback) => {
        if (room) {
            callback(messageStore.find(room));
        }
    });
}
