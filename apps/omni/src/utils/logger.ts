import pino from 'pino'

const isProd = process.env.NODE_ENV === 'production'

const loggerConfig = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(isProd
    ? {}
    : {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        }
      }
    })
})

export const logger = pino(loggerConfig);

export const createLogger = (bindings = {}) => {
  return logger.child(bindings);
}
