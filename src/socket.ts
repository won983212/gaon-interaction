import { Namespace, Server, Socket } from 'socket.io';
import http from 'http';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IUser, UserIdentifier } from './types';
import { getUserInfo } from './api/auth';
import logger from '@/logger';
import cookie from 'cookie';
import Chat from '@/chat';
import CodeShare from '@/codeshare';
import Whiteboard from '@/whiteboard';

export interface SocketData {
    userToken: UserIdentifier;
    user: IUser;
    room: string;
}

export interface SocketMiddleware {
    namespace: SocketNamespace;
    socket: Socket<DefaultEventsMap,
        DefaultEventsMap,
        DefaultEventsMap,
        SocketData>;
    user: IUser;
}

export type SocketNamespace = Namespace<DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    SocketData>;

export function attachTokenAuth(namespace: SocketNamespace) {
    namespace.use(async (socket, next) => {
        if (!socket.request.headers.cookie) {
            return next(new Error('Invaild token cookie.'));
        }

        try {
            const auth = JSON.parse(
                cookie.parse(socket.request.headers.cookie).usr
            );
            if (!auth.userId || !auth.token) {
                return next(new Error('Invaild token cookie.'));
            }

            logger.info(
                `Request auth: {userId: ${auth.userId}, token: ${auth.token}}`
            );

            const response = await getUserInfo(auth.userId, auth.token);
            logger.info(`Authenticated ${auth.userId}`);
            socket.data.user = response.data;
            socket.data.userToken = { userId: auth.userId, token: auth.token };
            socket.data.room = 'no-channel';
            next();
        } catch (err) {
            logger.warn('Invaild token. ' + err);
            return next(new Error('Invaild token'));
        }
    });
}

export default function socket(httpServer: http.Server) {
    const io = new Server<DefaultEventsMap,
        DefaultEventsMap,
        DefaultEventsMap,
        SocketData>(httpServer);
    const namespace = io.of(/^\/workspace-.+$/);
    attachTokenAuth(namespace);

    namespace.on('connection', (socket) => {
        const user = socket.data.user;
        if (!user) {
            return;
        }

        socket.on('channel', (channel) => {
            if (!channel) {
                channel = 'no-channel';
            }
            if (socket.data.room) {
                socket.leave(socket.data.room);
            }
            socket.data.room = channel;
            socket.join(channel);
        });

        // middlewares
        const middlewareArg: SocketMiddleware = { namespace, socket, user };
        Chat(middlewareArg);
        CodeShare(middlewareArg);
        Whiteboard(middlewareArg);
    });

    return io;
}
