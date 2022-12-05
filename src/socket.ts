import { Namespace, Server, Socket } from 'socket.io';
import http from 'http';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IConnectedUser, IUser, UserIdentifier } from './types';
import { getPermission, getUserInfo } from './api/auth';
import logger from '@/logger';
import cookie from 'cookie';
import Chat from '@/chat';
import CodeShare from '@/codeshare';
import Whiteboard from '@/whiteboard';
import { getEmptyRoomId } from '@/util/room';
import { ListMemoryStore } from '@/util/memoryStore';

export interface SocketData {
    userToken: UserIdentifier;
    user: IUser;
    room: number;
}

export type SocketType = Socket<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    SocketData
>;

export interface SocketMiddleware {
    namespace: SocketNamespace;
    socket: SocketType;
    user: IUser;
}

export type SocketNamespace = Namespace<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    SocketData
>;

const onlineUsers = new ListMemoryStore<SocketType>();

function convertToConnectedUser(socket: SocketType): IConnectedUser {
    if (!socket.data.user) {
        throw new Error('socket.data.user must not be undefined.');
    }
    return {
        id: socket.data.user.id,
        userId: socket.data.user.userId,
        socketId: socket.id,
        username: socket.data.user.username,
        mute: false
    };
}

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
            socket.data.room = getEmptyRoomId();
            next();
        } catch (err) {
            logger.warn('Invaild token. ' + err);
            return next(new Error('Invaild token'));
        }
    });
}

export default function socket(httpServer: http.Server) {
    const io = new Server<
        DefaultEventsMap,
        DefaultEventsMap,
        DefaultEventsMap,
        SocketData
    >(httpServer, {
        maxHttpBufferSize: 1e8
    });
    const namespace = io.of(/^\/workspace-.+$/);
    attachTokenAuth(namespace);

    namespace.on('connection', (socket) => {
        const user = socket.data.user;
        if (!user) {
            return;
        }

        const leaveRoom = () => {
            if (socket.data.user) {
                if (socket.data.room) {
                    socket.leave(socket.data.room.toString());
                    socket.broadcast
                        .to(socket.data.room.toString())
                        .emit('leave-user', convertToConnectedUser(socket));
                    onlineUsers.remove(
                        socket.data.room,
                        (element) => element.id !== socket.id
                    );
                }
            }
        };

        socket.on('channel', (channel: number) => {
            try {
                if (!channel) {
                    channel = getEmptyRoomId();
                }

                if (socket.data.user) {
                    leaveRoom();
                    logger.info(
                        `'${socket.data.user.username}' move channel ${socket.data.room} -> ${channel}`
                    );
                    socket.data.room = channel;
                    socket.join(channel.toString());
                    socket.broadcast
                        .to(channel.toString())
                        .emit('join-user', convertToConnectedUser(socket));
                    onlineUsers.append(socket.data.room, socket);
                }
            } catch (e) {
                logger.error(e);
            }
        });

        socket.on(
            'select-users',
            async (
                channel: number,
                callback: (users: IConnectedUser[]) => void
            ) => {
                try {
                    const sockets = onlineUsers.find(channel);
                    const thisUser = convertToConnectedUser(socket);
                    let users = sockets.map((socket): IConnectedUser => {
                        if (!socket.data.user) {
                            throw new Error('Socket data is null.');
                        }
                        return convertToConnectedUser(socket);
                    });

                    if (
                        !users.find(
                            (element) => element.socketId === thisUser.socketId
                        )
                    ) {
                        users = users.concat(thisUser);
                    }

                    callback(users);
                } catch (e) {
                    callback([]);
                    logger.error(e);
                }
            }
        );

        socket.on('kick-user', async (workspaceId: number, channelId: number, userId: number) => {
            try {
                if (socket.data.user) {
                    if (socket.data.room) {
                        console.log(`userId: ${userId} channelId: ${channelId}`);
                        let request = (await getPermission(workspaceId, socket.data.user.id)).data;
                        if (request.permission <= 0) {
                            throw new Error(`User ${socket.data.user.id} tried to kick user ${userId} but failed.`);
                        }
                        const sockets = onlineUsers.find(channelId);
                        const found = sockets.find((value) => {
                            if (value.data.user) {
                                return value.data.user.id === userId;
                            }
                            return false;
                        });
                        if (found) {
                            console.log("found");
                            found.leave(socket.data.room.toString());
                            found.broadcast
                                .to(socket.data.room.toString())
                                .emit('leave-user', convertToConnectedUser(found));
                            onlineUsers.remove(
                                socket.data.room,
                                (element) => element.id !== found.id
                            );
                            found.disconnect(true);
                        }
                        
                    }
                }
            } catch (e) {
                logger.error(e);
            }
        });

        socket.on('disconnect', () => {
            try {
                leaveRoom();
            } catch (e) {
                logger.error(e);
            }
        });

        // middlewares
        const middlewareArg: SocketMiddleware = { namespace, socket, user };
        Chat(middlewareArg);
        CodeShare(middlewareArg);
        Whiteboard(middlewareArg);
    });

    return io;
}
