import { FastifyPluginAsync } from 'fastify';
import { SuccessResponse } from '../../core/ApiResponse';
import { RoleRequest } from 'app-request';
import crypto from 'crypto';
import UserRepo from '../../database/repository/UserRepo';
import { BadRequestError } from '../../core/ApiError';
import User from '../../database/model/User';
import { createTokens } from '../../auth/authUtils';
import validator from '../../helpers/validator';
import schema from './schema';
import bcrypt from 'bcrypt';
import { RoleCode } from '../../database/model/Role';
import { getUserData } from './utils';

const signup: FastifyPluginAsync = async (router) => {
  router.post(
    '/basic',
    { preHandler: [validator(schema.signup)] },
    async (req: RoleRequest, res) => {
      const user = await UserRepo.findByEmail(req.body.email);
      if (user) throw new BadRequestError('User already registered');

      const accessTokenKey = crypto.randomBytes(64).toString('hex');
      const refreshTokenKey = crypto.randomBytes(64).toString('hex');
      const passwordHash = await bcrypt.hash(req.body.password, 10);

      const { user: createdUser, keystore } = await UserRepo.create(
        {
          name: req.body.name,
          email: req.body.email,
          profilePicUrl: req.body.profilePicUrl,
          password: passwordHash,
        } as User,
        accessTokenKey,
        refreshTokenKey,
        RoleCode.LEARNER,
      );

      const tokens = await createTokens(
        createdUser,
        keystore.primaryKey,
        keystore.secondaryKey,
      );
      const userData = await getUserData(createdUser);

      return new SuccessResponse('Signup Successful', {
        user: userData,
        tokens: tokens,
      }).send(res);
    },
  );
};

export default signup;
