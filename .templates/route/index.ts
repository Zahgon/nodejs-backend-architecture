/* import { FastifyPluginAsync } from 'fastify';
import { ProtectedRequest } from 'app-request';
import { SuccessResponse } from '../../core/ApiResponse';
import validator, { ValidationSource } from '../../helpers/validator';
import schema from './schema';
import notFound from '../../helpers/notFound';
import role from '../../helpers/role';
import authentication from '../../auth/authentication';
import authorization from '../../auth/authorization';
import { RoleCode } from '../../database/model/Role';

const sample: FastifyPluginAsync = async (router) => {
  //----------------------------------------------------------------
  router.addHook('preHandler', authentication);
  router.addHook('preHandler', role(RoleCode.LEARNER));
  router.addHook('preHandler', authorization);
  //----------------------------------------------------------------
  notFound(router);

  router.post(
    '/sample',
    { preHandler: [validator(schema.sample, ValidationSource.BODY)] },
    async (req: ProtectedRequest, res) => {
      return new SuccessResponse('Success', {}).send(res);
    },
  );
};

export default sample; */
