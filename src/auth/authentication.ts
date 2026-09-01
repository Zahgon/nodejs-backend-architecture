import { FastifyReply } from 'fastify';
import { ProtectedRequest } from 'app-request';
import UserRepo from '../database/repository/UserRepo';
import {
  AuthFailureError,
  AccessTokenError,
  TokenExpiredError,
} from '../core/ApiError';
import JWT from '../core/JWT';
import KeystoreRepo from '../database/repository/KeystoreRepo';
import { Types } from 'mongoose';
import { getAccessToken, validateTokenData } from './authUtils';
import validator, { ValidationSource } from '../helpers/validator';
import schema from './schema';

const validateHeader = validator(schema.auth, ValidationSource.HEADER);

export default async (req: ProtectedRequest, reply: FastifyReply) => {
  await validateHeader(req, reply);

  req.accessToken = getAccessToken(req.headers.authorization); // Fastify headers are auto converted to lowercase

  try {
    const payload = await JWT.validate(req.accessToken);
    validateTokenData(payload);

    const user = await UserRepo.findById(new Types.ObjectId(payload.sub));
    if (!user) throw new AuthFailureError('User not registered');
    req.user = user;

    const keystore = await KeystoreRepo.findforKey(req.user, payload.prm);
    if (!keystore) throw new AuthFailureError('Invalid access token');
    req.keystore = keystore;
  } catch (e) {
    if (e instanceof TokenExpiredError) throw new AccessTokenError(e.message);
    throw e;
  }
};
