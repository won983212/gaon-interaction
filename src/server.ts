import morgan from 'morgan';
import http from 'http';
import helmet from 'helmet';
import StatusCodes from 'http-status-codes';
import express, { NextFunction, Request, Response } from 'express';
import router from './routes';
import socket from './socket';
import logger from '@/logger';
const setupWSConnection = require('y-websocket/bin/utils').setupWSConnection;

const app = express();

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
app.set('socket-io', io);
io.on('connection', (socket) =>
    setupWSConnection(socket.conn, socket.request, {
        gc: socket.request.url?.slice(1) !== 'prosemirror-versions'
    })
);

export default server;
