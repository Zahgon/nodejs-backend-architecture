import { FastifyPluginAsync } from 'fastify';
import { SuccessResponse } from '../../core/ApiResponse';

const health: FastifyPluginAsync = async (router) => {
  router.get('/', async (_req, res) => {
    return new SuccessResponse('Success', { timestamp: new Date() }).send(res);
  });
};

export default health;
