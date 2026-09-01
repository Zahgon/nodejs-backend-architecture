import { FastifyPluginAsync } from 'fastify';
import { SuccessResponse } from '../../core/ApiResponse';
import { PublicRequest } from 'app-request';
import validator, { ValidationSource } from '../../helpers/validator';
import schema from './schema';
import { NotFoundError } from '../../core/ApiError';
import BlogRepo from '../../database/repository/BlogRepo';
import { Types } from 'mongoose';
import writer from './writer';
import editor from './editor';
import BlogCache from '../../cache/repository/BlogCache';

const blog: FastifyPluginAsync = async (router) => {
  router.register(writer, { prefix: '/writer' });
  router.register(editor, { prefix: '/editor' });

  router.get(
    '/url',
    { preHandler: [validator(schema.blogUrl, ValidationSource.QUERY)] },
    async (req: PublicRequest, res) => {
      const blogUrl = req.query.endpoint as string;
      let blog = await BlogCache.fetchByUrl(blogUrl);

      if (!blog) {
        blog = await BlogRepo.findPublishedByUrl(blogUrl);
        if (blog) await BlogCache.save(blog);
      }

      if (!blog) throw new NotFoundError('Blog not found');
      return new SuccessResponse('success', blog).send(res);
    },
  );

  router.get(
    '/id/:id',
    { preHandler: [validator(schema.blogId, ValidationSource.PARAM)] },
    async (req: PublicRequest, res) => {
      const blogId = new Types.ObjectId(req.params.id);
      let blog = await BlogCache.fetchById(blogId);

      if (!blog) {
        blog = await BlogRepo.findInfoForPublishedById(
          new Types.ObjectId(req.params.id),
        );
        if (blog) await BlogCache.save(blog);
      }

      if (!blog) throw new NotFoundError('Blog not found');
      return new SuccessResponse('success', blog).send(res);
    },
  );
};

export default blog;
