import morgan from 'morgan';
import http from 'http';
import logger from 'jet-logger';
import helmet from 'helmet';
import StatusCodes from 'http-status-codes';
import express, { NextFunction, Request, Response } from 'express';
import router from './routes';
import socket from './socket';

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
    logger.err(err, true);
    return res.status(StatusCodes.BAD_REQUEST).json({
        error: err.message
    });
});

const server = http.createServer(app);
const io = socket(server);
app.set('socket-io', io);

export default server;
