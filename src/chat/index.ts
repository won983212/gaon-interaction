import { SocketMiddleware } from '@/socket';
import { IMessage } from '@/types';
import dayjs from 'dayjs';
import logger from '@/logger';
import { ListMemoryStore } from '@/util/memoryStore';

const messageStore = new ListMemoryStore<IMessage>();

export default function Chat({ namespace, socket, user }: SocketMiddleware) {
    socket.on('message', (message) => {
        const msg: IMessage = {
            sender: user.username,
            message: message,
            date: dayjs().unix()
        };

        if (socket.data.room && message) {
            logger.info(
                `[Chat-${socket.data.room}] ${msg.sender}: ${msg.message}`
            );
            messageStore.append(socket.data.room, msg);
            namespace.to(socket.data.room).emit('message', msg);
        }
    });

    socket.on('select-messages', (room, callback) => {
        if (room) {
            callback(messageStore.find(room));
        }
    });
}
