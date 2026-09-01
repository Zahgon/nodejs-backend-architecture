import { RoleCode } from '../database/model/Role';
import { RoleRequest } from 'app-request';
import { FastifyReply } from 'fastify';

export default (...roleCodes: RoleCode[]) =>
  async (req: RoleRequest, _reply: FastifyReply): Promise<void> => {
    req.currentRoleCodes = roleCodes;
  };
