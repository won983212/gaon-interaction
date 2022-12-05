import morgan from 'morgan';
import http from 'http';
import helmet from 'helmet';
import StatusCodes from 'http-status-codes';
import express, { NextFunction, Request, Response } from 'express';
import router from './routes';
import socket from './socket';
import logger from '@/logger';
import * as path from 'path';
import {YSocketIO} from 'y-socket.io/dist/server';
import { Socket } from 'socket.io';

const app = express();

app.use('/static', express.static(path.join(__dirname, '../uploads')))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
}

app.use('/', router);

app.use((err: Error, _: Request, res: Response, __: NextFunction) => {
    logger.error(err);
    return res.status(StatusCodes.BAD_REQUEST).json({
        error: err.message
    });
});

const server = http.createServer(app);
const io = socket(server);

io.on('connection', (socket: Socket) => {
    logger.info(`[connection] Connected with user: ${socket.id}`)
    socket.on('disconnect', () => {
        logger.info(`[disconnect] Disconnected with user: ${socket.id}`)
    })
})

const ysocketio = new YSocketIO(io)
ysocketio.initialize()
app.set('socket-io', io);

export default server;
