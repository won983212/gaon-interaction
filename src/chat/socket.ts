import { SocketInitializer } from '@/socket';
import { IMessage } from '@/types';
import dayjs from 'dayjs';
import logger from 'jet-logger';

export const chatSocketInitializer: SocketInitializer = (io) => {
    io.of('/chat').on('connection', (socket) => {
        const msg: IMessage = {
            sender: 'Admin',
            message: 'Welcome ' + socket.data.user?.username,
            date: dayjs().unix()
        };
        logger.info('connected: ' + socket.data.user?.username);
        socket.emit('message', msg);

        socket.broadcast.emit('user connected', socket.data.user?.username);

        socket.on('disconnect', () => {
            socket.broadcast.emit('user disconnected', socket.id);
        });
    });
    return io;
};
