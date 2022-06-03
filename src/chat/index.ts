import { SocketMiddleware } from '@/socket';
import { IMessage } from '@/types';
import dayjs from 'dayjs';
import logger from '@/logger';
import { ListMemoryStore } from '@/util/memoryStore';
import { getValidatedRoom } from '@/util/room';

const messageStore = new ListMemoryStore<IMessage>();

export default function Chat({ namespace, socket, user }: SocketMiddleware) {
    socket.on('message', (message: string) => {
        try {
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
        } catch (e) {
            logger.error(e);
        }
    });

    socket.on('select-messages', (room: number, callback) => {
        try {
            if (room) {
                callback(messageStore.find(room));
                return;
            }
        } catch (e) {
            logger.error(e);
        } finally {
            callback([]);
        }
    });
}
