import { FastifyReply } from 'fastify';
import { ForbiddenError } from '../core/ApiError';
import { PublicRequest } from '../types/app-request';

export default (permission: string) =>
  async (req: PublicRequest, _reply: FastifyReply): Promise<void> => {
    if (!req.apiKey?.permissions) throw new ForbiddenError('Permission Denied');

    const exists = req.apiKey.permissions.find((entry) => entry === permission);
    if (!exists) throw new ForbiddenError('Permission Denied');
  };
