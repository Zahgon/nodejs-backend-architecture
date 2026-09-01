import { FastifyPluginAsync } from 'fastify';
import KeystoreRepo from '../../database/repository/KeystoreRepo';
import { ProtectedRequest } from 'app-request';
import { SuccessMsgResponse } from '../../core/ApiResponse';
import notFound from '../../helpers/notFound';
import authentication from '../../auth/authentication';

const logout: FastifyPluginAsync = async (router) => {
  /*-------------------------------------------------------------------------*/
  router.addHook('preHandler', authentication);
  /*-------------------------------------------------------------------------*/
  notFound(router);

  router.delete('/', async (req: ProtectedRequest, res) => {
    await KeystoreRepo.remove(req.keystore._id);
    return new SuccessMsgResponse('Logout success').send(res);
  });
};

export default logout;
