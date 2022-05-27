import logger from 'jet-logger';
import server from './server';
import config from '../config.json';

const port = process.env.PORT || config.port;

server.listen(port, () => {
    logger.info('Express server started on port: ' + port);
});
