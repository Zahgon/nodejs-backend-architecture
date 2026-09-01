import { FastifyPluginAsync } from 'fastify';
import { SuccessResponse } from '../../core/ApiResponse';
import { RoleRequest } from 'app-request';
import UserRepo from '../../database/repository/UserRepo';
import { BadRequestError } from '../../core/ApiError';
import User from '../../database/model/User';
import validator from '../../helpers/validator';
import schema from './schema';
import notFound from '../../helpers/notFound';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import { RoleCode } from '../../database/model/Role';
import role from '../../helpers/role';
import authorization from '../../auth/authorization';
import authentication from '../../auth/authentication';
import KeystoreRepo from '../../database/repository/KeystoreRepo';

const credential: FastifyPluginAsync = async (router) => {
  //----------------------------------------------------------------
  router.addHook('preHandler', authentication);
  router.addHook('preHandler', role(RoleCode.ADMIN));
  router.addHook('preHandler', authorization);
  //----------------------------------------------------------------
  notFound(router);

  router.post(
    '/user/assign',
    { preHandler: [validator(schema.credential)] },
    async (req: RoleRequest, res) => {
      const user = await UserRepo.findByEmail(req.body.email);
      if (!user) throw new BadRequestError('User do not exists');

      const passwordHash = await bcrypt.hash(req.body.password, 10);

      await UserRepo.updateInfo({
        _id: user._id,
        password: passwordHash,
      } as User);

      await KeystoreRepo.removeAllForClient(user);

      return new SuccessResponse(
        'User password updated',
        _.pick(user, ['_id', 'name', 'email']),
      ).send(res);
    },
  );
};

export default credential;
