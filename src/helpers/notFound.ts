import { FastifyInstance } from 'fastify';
import { NotFoundError } from '../core/ApiError';

/**
 * Fastify serves an unmatched url with the not found handler registered closest
 * to it. Declaring one inside a scope therefore makes the hooks of that scope
 * (api key, authentication, authorization) run before the 404 is produced.
 */
export default (router: FastifyInstance): void => {
  router.setNotFoundHandler(async () => {
    throw new NotFoundError();
  });
};
