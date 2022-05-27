import { Server } from 'socket.io';
import http from 'http';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IUser, UserIdentifier } from './types';
import { getUserInfo } from './api/auth';
import logger from 'jet-logger';

export interface SocketData {
    userToken: UserIdentifier;
    user: IUser;
}

function socket(httpServer: http.Server) {
    const io = new Server<
        DefaultEventsMap,
        DefaultEventsMap,
        DefaultEventsMap,
        SocketData
    >(httpServer);

    io.use(async (socket, next) => {
        const userId = socket.handshake.auth.userId;
        const token = socket.handshake.auth.token;
        if (!userId || !token) {
            return next(new Error('Invaild token'));
        }

        try {
            const response = await getUserInfo(userId, token);
            socket.data.user = response.data;
            socket.data.userToken = { userId, token };
            next();
        } catch (err) {
            logger.warn(err);
            return next(new Error('Invaild token'));
        }
    });

    io.on('connection', (socket) => {
        socket.emit('message', 'Welcome! ' + socket.data.user?.username);

        socket.broadcast.emit('user connected', socket.data.user?.username);

        socket.on('disconnect', () => {
            socket.broadcast.emit('user disconnected', socket.id);
        });
    });

    return io;
}

export default socket;
