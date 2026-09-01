import Fastify, { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import qs from 'qs';
import Logger from './core/Logger';
import { corsUrl, environment } from './config';
import './database'; // initialize database
import './cache'; // initialize cache
import {
  BadRequestError,
  ApiError,
  InternalError,
  ErrorType,
} from './core/ApiError';
import routes from './routes';

process.on('uncaughtException', (e) => {
  Logger.error(e);
});

const BODY_LIMIT = 10 * 1024 * 1024; // 10mb

const app = Fastify({ bodyLimit: BODY_LIMIT });

// A body parser is only reached when a body is actually sent, so an empty json
// payload is resolved to an empty object instead of being rejected.
app.addContentTypeParser<string>(
  'application/json',
  { parseAs: 'string', bodyLimit: BODY_LIMIT },
  (_req, body, done) => {
    if (!body) return done(null, {});
    try {
      done(null, JSON.parse(body));
    } catch (e) {
      done(new BadRequestError('Invalid json body'), undefined);
    }
  },
);

app.register(formbody, {
  bodyLimit: BODY_LIMIT,
  parser: (body) => qs.parse(body, { parameterLimit: 50000 }),
});
app.register(cors, { origin: corsUrl, optionsSuccessStatus: 200 });

// Routes
app.register(routes);

// Error Handler
const errorHandler = (
  err: FastifyError,
  req: FastifyRequest,
  res: FastifyReply,
) => {
  if (err instanceof ApiError) {
    ApiError.handle(err, res);
    if (err.type === ErrorType.INTERNAL)
      Logger.error(
        `500 - ${err.message} - ${req.url} - ${req.method} - ${req.ip}`,
      );
  } else {
    Logger.error(
      `500 - ${err.message} - ${req.url} - ${req.method} - ${req.ip}`,
    );
    Logger.error(err);
    if (environment === 'development') {
      return res.status(500).send(err);
    }
    ApiError.handle(new InternalError(), res);
  }
};

app.setErrorHandler(errorHandler);

export default app;
