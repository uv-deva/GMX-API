const winston = require('winston');
// Create a logger with different transports
const logger = winston.createLogger({
    level: 'info',  // Default logging level
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.File({ filename: 'errors.log', level: 'error' })
    ]
});
module.exports = logger;