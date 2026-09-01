import { FastifyRequest } from 'fastify';
import { ForbiddenError } from '../core/ApiError';
import { findIpAddress } from './utils';

export function restrictIpAddress(req: FastifyRequest, ipAddress: string) {
  if (ipAddress === '*') return;
  const ip = findIpAddress(req);
  if (!ip) throw new ForbiddenError('IP Address Not Recognised');
  if (ipAddress !== ip) throw new ForbiddenError('Permission Denied');
}
