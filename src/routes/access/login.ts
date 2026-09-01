import { FastifyPluginAsync } from 'fastify';
import { SuccessResponse } from '../../core/ApiResponse';
import crypto from 'crypto';
import UserRepo from '../../database/repository/UserRepo';
import { BadRequestError, AuthFailureError } from '../../core/ApiError';
import KeystoreRepo from '../../database/repository/KeystoreRepo';
import { createTokens } from '../../auth/authUtils';
import validator from '../../helpers/validator';
import schema from './schema';
import bcrypt from 'bcrypt';
import { getUserData } from './utils';
import { PublicRequest } from '../../types/app-request';

const login: FastifyPluginAsync = async (router) => {
  router.post(
    '/basic',
    { preHandler: [validator(schema.credential)] },
    async (req: PublicRequest, res) => {
      const user = await UserRepo.findByEmail(req.body.email);
      if (!user) throw new BadRequestError('User not registered');
      if (!user.password) throw new BadRequestError('Credential not set');

      const match = await bcrypt.compare(req.body.password, user.password);
      if (!match) throw new AuthFailureError('Authentication failure');

      const accessTokenKey = crypto.randomBytes(64).toString('hex');
      const refreshTokenKey = crypto.randomBytes(64).toString('hex');

      await KeystoreRepo.create(user, accessTokenKey, refreshTokenKey);
      const tokens = await createTokens(user, accessTokenKey, refreshTokenKey);
      const userData = await getUserData(user);

      return new SuccessResponse('Login Success', {
        user: userData,
        tokens: tokens,
      }).send(res);
    },
  );
};

export default login;
