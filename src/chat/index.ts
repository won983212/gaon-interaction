import { SocketMiddleware } from '@/socket';
import { FileMessage, IMessage, TextMessage } from '@/types';
import dayjs from 'dayjs';
import logger from '@/logger';
import { ListMemoryStore } from '@/util/memoryStore';
import { getValidatedRoom } from '@/util/room';
import * as fs from 'fs';

const uploadPath = 'uploads';
const messageStore = new ListMemoryStore<IMessage>();

function hash(len: number) {
    const template = '0123456789abcdef';
    let ret = '';
    for (let i = 0; i < len; i++) {
        ret += template[Math.floor(Math.random() * template.length)];
    }
    return ret;
}

function generate32Hash() {
    while (true) {
        const name = hash(32)
        const path = uploadPath + '/' + name;
        if (!fs.existsSync(path)) {
            return name;
        }
    }
}

export default function Chat({ namespace, socket, user }: SocketMiddleware) {
    socket.on('chat-message', (message: string) => {
        try {
            const msg: TextMessage = {
                type: 'text',
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

    socket.on('chat-file', (file: Buffer, name: string, callback) => {
        const actualFileName = generate32Hash();
        const msg: FileMessage = {
            type: 'file',
            sender: user.username,
            name: name,
            url: 'static/' + actualFileName,
            date: dayjs().unix()
        };

        const room = getValidatedRoom(socket.data.room);
        if (room && name) {
            logger.info(
                `[File-${socket.data.room}] ${msg.sender}: ${msg.name}`
            );
            messageStore.append(room, msg);
            namespace.to(room.toString()).emit('message', msg);
            fs.writeFile(`${uploadPath}/${actualFileName}`, file, (err) => {
                if (err) {
                    callback(false);
                    logger.error(err);
                } else {
                    callback(true);
                    logger.info(`Write to ${actualFileName}`)
                }
            });
        } else {
            callback(false);
            logger.error(`Invalid room id(${room}) or name(${name})`);
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
