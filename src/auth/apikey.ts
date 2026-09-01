import { FastifyReply } from 'fastify';
import ApiKeyRepo from '../database/repository/ApiKeyRepo';
import { ForbiddenError } from '../core/ApiError';
import { PublicRequest } from 'app-request';
import schema from './schema';
import validator, { ValidationSource } from '../helpers/validator';
import { Header } from '../core/utils';

const validateHeader = validator(schema.apiKey, ValidationSource.HEADER);

export default async (req: PublicRequest, reply: FastifyReply) => {
  await validateHeader(req, reply);

  const key = req.headers[Header.API_KEY]?.toString();
  if (!key) throw new ForbiddenError();

  const apiKey = await ApiKeyRepo.findByKey(key);
  if (!apiKey) throw new ForbiddenError();

  req.apiKey = apiKey;
};
