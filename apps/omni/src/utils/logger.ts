import pino from 'pino'

const isProd = process.env.NODE_ENV === 'production'

export const logger = pino({
  ...(isProd
    ? {}
    : {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    }),
})
