import winston from 'winston';
import winstonDRF from 'winston-daily-rotate-file';

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:MM:SS'
        }),
        winston.format.printf(
            (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
        )
    ),
    transports: [
        new winstonDRF({
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            dirname: 'logs',
            filename: `%DATE%.log`,
            maxFiles: 30,
            zippedArchive: true
        }),
        new winstonDRF({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: 'logs/error',
            filename: `%DATE%.log`,
            maxFiles: 30,
            zippedArchive: true
        })
    ]
});

// production이 아닌 환경에서는 좀 더 pretty하게
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:MM:SS'
                }),
                winston.format.colorize(),
                winston.format.printf(
                    (info) => `${info.level}: ${info.message}`
                )
            )
        })
    );
}

export default logger;
