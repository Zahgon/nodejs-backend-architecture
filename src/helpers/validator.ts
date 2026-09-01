import { z } from 'zod';
import { FastifyReply, FastifyRequest } from 'fastify';
import { BadRequestError } from '../core/ApiError';

export enum ValidationSource {
  BODY = 'body',
  HEADER = 'headers',
  QUERY = 'query',
  PARAM = 'params',
}

/** Validates a 24-character hex MongoDB ObjectId string */
export const zObjectId = () =>
  z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid id');

/** Validates an "Authorization: Bearer <token>" header value */
export const zAuthBearer = () =>
  z.string().regex(/^Bearer\s.+$/, 'invalid bearer token');

export const zUrlEndpoint = (maxLength?: number) => {
  const base = maxLength !== undefined ? z.string().max(maxLength) : z.string();
  return base.refine((value) => !value.includes('://'), 'invalid url endpoint');
};

/**
 *
 * @param schema  Any z.ZodType (z.object, z.email, z.string, etc.)
 * @param source  Part of the request to validate (default: 'body')
 */
export default (
    schema: z.ZodType,
    source: ValidationSource = ValidationSource.BODY,
  ) =>
  async (req: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const result = schema.safeParse(req[source]);

    if (result.success) return;

    // Prepend field name to every Zod default message:
    //   "Required"       -> "email: Required"
    const message = result.error.issues
      .map((issue) => {
        const field = issue.path?.at(-1);
        return field ? `${String(field)}: ${issue.message}` : issue.message;
      })
      .join(', ');

    throw new BadRequestError(message);
  };
