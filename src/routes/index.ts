import { FastifyPluginAsync } from 'fastify';
import health from './health';
import apikey from '../auth/apikey';
import permission from '../helpers/permission';
import notFound from '../helpers/notFound';
import { Permission } from '../database/model/ApiKey';
import signup from './access/signup';
import login from './access/login';
import logout from './access/logout';
import token from './access/token';
import credential from './access/credential';
import blog from './blog';
import blogs from './blogs';
import profile from './profile';

const routes: FastifyPluginAsync = async (router) => {
  /*---------------------------------------------------------*/
  router.register(health, { prefix: '/health' });
  /*---------------------------------------------------------*/
  router.register(async (secured) => {
    /*---------------------------------------------------------*/
    secured.addHook('preHandler', apikey);
    /*---------------------------------------------------------*/
    /*---------------------------------------------------------*/
    secured.addHook('preHandler', permission(Permission.GENERAL));
    /*---------------------------------------------------------*/
    notFound(secured);

    secured.register(signup, { prefix: '/signup' });
    secured.register(login, { prefix: '/login' });
    secured.register(logout, { prefix: '/logout' });
    secured.register(token, { prefix: '/token' });
    secured.register(credential, { prefix: '/credential' });
    secured.register(profile, { prefix: '/profile' });
    secured.register(blog, { prefix: '/blog' });
    secured.register(blogs, { prefix: '/blogs' });
  });
};

export default routes;
