import { FastifyRequest } from 'fastify';
import User from '../database/model/User';
import Keystore from '../database/model/Keystore';
import ApiKey from '../database/model/ApiKey';

// The payload of a request is validated by zod before a handler reads it, so the
// route generics are kept open the way the framework request object was typed before.
declare interface AppRequest extends FastifyRequest {
  body: any;
  query: any;
  params: any;
}

declare interface PublicRequest extends AppRequest {
  apiKey: ApiKey;
}

declare interface RoleRequest extends PublicRequest {
  currentRoleCodes: string[];
}

declare interface ProtectedRequest extends RoleRequest {
  user: User;
  accessToken: string;
  keystore: Keystore;
}

declare interface Tokens {
  accessToken: string;
  refreshToken: string;
}
