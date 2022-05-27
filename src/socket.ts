import { Server } from 'socket.io';
import http from 'http';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IUser, UserIdentifier } from './types';
import { getUserInfo } from './api/auth';
import logger from 'jet-logger';
import { chatSocketInitializer } from '@/chat/socket';

export interface SocketData {
    userToken: UserIdentifier;
    user: IUser;
}

export type SocketInitializer = (
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>
) => Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>;

function socket(httpServer: http.Server) {
    let io = new Server<
        DefaultEventsMap,
        DefaultEventsMap,
        DefaultEventsMap,
        SocketData
    >(httpServer);

    io.of('/chat').use(async (socket, next) => {
        const userId = socket.handshake.auth.userId;
        const token = socket.handshake.auth.token;

        logger.info('auth: ' + userId + ' ' + token);
        if (!userId || !token) {
            return next(new Error('Invaild auth info.'));
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

    io = chatSocketInitializer(io);
    return io;
}

export default socket;
