import { FastifyPluginAsync } from 'fastify';
import { SuccessResponse } from '../../core/ApiResponse';
import { PublicRequest } from 'app-request';
import validator, { ValidationSource } from '../../helpers/validator';
import schema from './schema';
import { BadRequestError } from '../../core/ApiError';
import BlogRepo from '../../database/repository/BlogRepo';
import { Types } from 'mongoose';
import User from '../../database/model/User';
import BlogsCache from '../../cache/repository/BlogsCache';

const blogs: FastifyPluginAsync = async (router) => {
  router.get(
    '/tag/:tag',
    {
      preHandler: [
        validator(schema.blogTag, ValidationSource.PARAM),
        validator(schema.pagination, ValidationSource.QUERY),
      ],
    },
    async (req: PublicRequest, res) => {
      const blogs = await BlogRepo.findByTagAndPaginated(
        req.params.tag,
        parseInt(req.query.pageNumber as string),
        parseInt(req.query.pageItemCount as string),
      );
      return new SuccessResponse('success', blogs).send(res);
    },
  );

  router.get(
    '/author/id/:id',
    { preHandler: [validator(schema.authorId, ValidationSource.PARAM)] },
    async (req: PublicRequest, res) => {
      const blogs = await BlogRepo.findAllPublishedForAuthor({
        _id: new Types.ObjectId(req.params.id),
      } as User);
      return new SuccessResponse('success', blogs).send(res);
    },
  );

  router.get(
    '/latest',
    { preHandler: [validator(schema.pagination, ValidationSource.QUERY)] },
    async (req: PublicRequest, res) => {
      const blogs = await BlogRepo.findLatestBlogs(
        parseInt(req.query.pageNumber as string),
        parseInt(req.query.pageItemCount as string),
      );
      return new SuccessResponse('success', blogs).send(res);
    },
  );

  router.get(
    '/similar/id/:id',
    { preHandler: [validator(schema.blogId, ValidationSource.PARAM)] },
    async (req: PublicRequest, res) => {
      const blogId = new Types.ObjectId(req.params.id);
      let blogs = await BlogsCache.fetchSimilarBlogs(blogId);

      if (!blogs) {
        const blog = await BlogRepo.findInfoForPublishedById(
          new Types.ObjectId(req.params.id),
        );
        if (!blog) throw new BadRequestError('Blog is not available');
        blogs = await BlogRepo.searchSimilarBlogs(blog, 6);

        if (blogs && blogs.length > 0)
          await BlogsCache.saveSimilarBlogs(blogId, blogs);
      }

      return new SuccessResponse('success', blogs ? blogs : []).send(res);
    },
  );
};

export default blogs;
