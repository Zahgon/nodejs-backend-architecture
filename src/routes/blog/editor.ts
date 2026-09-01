import { FastifyPluginAsync } from 'fastify';
import { SuccessResponse, SuccessMsgResponse } from '../../core/ApiResponse';
import { ProtectedRequest } from 'app-request';
import { BadRequestError, ForbiddenError } from '../../core/ApiError';
import BlogRepo from '../../database/repository/BlogRepo';
import { RoleCode } from '../../database/model/Role';
import { Types } from 'mongoose';
import validator, { ValidationSource } from '../../helpers/validator';
import schema from './schema';
import notFound from '../../helpers/notFound';
import authentication from '../../auth/authentication';
import authorization from '../../auth/authorization';
import role from '../../helpers/role';

const editor: FastifyPluginAsync = async (router) => {
  /*-------------------------------------------------------------------------*/
  router.addHook('preHandler', authentication);
  router.addHook('preHandler', role(RoleCode.ADMIN, RoleCode.EDITOR));
  router.addHook('preHandler', authorization);
  /*-------------------------------------------------------------------------*/
  notFound(router);

  router.put(
    '/publish/:id',
    { preHandler: [validator(schema.blogId, ValidationSource.PARAM)] },
    async (req: ProtectedRequest, res) => {
      const blog = await BlogRepo.findBlogAllDataById(
        new Types.ObjectId(req.params.id),
      );
      if (!blog) throw new BadRequestError('Blog does not exists');

      blog.isDraft = false;
      blog.isSubmitted = false;
      blog.isPublished = true;
      blog.text = blog.draftText;
      if (!blog.publishedAt) blog.publishedAt = new Date();

      await BlogRepo.update(blog);
      return new SuccessMsgResponse('Blog published successfully').send(res);
    },
  );

  router.put(
    '/unpublish/:id',
    { preHandler: [validator(schema.blogId, ValidationSource.PARAM)] },
    async (req: ProtectedRequest, res) => {
      const blog = await BlogRepo.findBlogAllDataById(
        new Types.ObjectId(req.params.id),
      );
      if (!blog) throw new BadRequestError('Blog does not exists');

      blog.isDraft = true;
      blog.isSubmitted = false;
      blog.isPublished = false;

      await BlogRepo.update(blog);
      return new SuccessMsgResponse('Blog unpublished successfully').send(res);
    },
  );

  router.delete(
    '/id/:id',
    { preHandler: [validator(schema.blogId, ValidationSource.PARAM)] },
    async (req: ProtectedRequest, res) => {
      const blog = await BlogRepo.findBlogAllDataById(
        new Types.ObjectId(req.params.id),
      );
      if (!blog) throw new BadRequestError('Blog does not exists');

      blog.status = false;

      await BlogRepo.update(blog);
      return new SuccessMsgResponse('Blog deleted successfully').send(res);
    },
  );

  router.get('/published/all', async (_req: ProtectedRequest, res) => {
    const blogs = await BlogRepo.findAllPublished();
    return new SuccessResponse('success', blogs).send(res);
  });

  router.get('/submitted/all', async (_req: ProtectedRequest, res) => {
    const blogs = await BlogRepo.findAllSubmissions();
    return new SuccessResponse('success', blogs).send(res);
  });

  router.get('/drafts/all', async (_req: ProtectedRequest, res) => {
    const blogs = await BlogRepo.findAllDrafts();
    return new SuccessResponse('success', blogs).send(res);
  });

  router.get(
    '/id/:id',
    { preHandler: [validator(schema.blogId, ValidationSource.PARAM)] },
    async (req: ProtectedRequest, res) => {
      const blog = await BlogRepo.findBlogAllDataById(
        new Types.ObjectId(req.params.id),
      );

      if (!blog) throw new BadRequestError('Blog does not exists');
      if (!blog.isSubmitted && !blog.isPublished)
        throw new ForbiddenError('This blog is private');

      return new SuccessResponse('success', blog).send(res);
    },
  );
};

export default editor;
