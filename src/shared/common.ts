import { z } from 'zod';

export const idValidationSchema = z.object({
  id: z.string().min(1, 'id is required'),
});
export const slugValidationSchema = z.object({
  slug: z.string().min(1, 'slug is required'),
});

export const ResponseBaseSchema = idValidationSchema.extend({
  _v: z.number(),
  // createdAt: z.date(),
  // updatedAt: z.date(),
});

export const QueryBaseValidationSchema = z.object({
  search: z.string().optional(),
  sort: z.string().optional().transform(val => val ? val.split(',') : undefined),
  order: z.string().optional().transform(val => val ? val.split(',') : undefined),
  filter: z.string().optional().transform(val => val ? val.split(',') : undefined),
  fields: z.string().optional().transform(val => val ? val.split(',') : undefined),
  include: z.string().optional().transform(val => val ? val.split(',') : undefined),
  exclude: z.string().optional().transform(val => val ? val.split(',') : undefined),
});
export const requestQueryValidationSchema = QueryBaseValidationSchema.extend({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
});

export const relayPaginationQueryValidationSchema = QueryBaseValidationSchema.extend({
  first: z.string().optional().transform(val => val ? parseInt(val) : 10),
  after: z.string().optional(),
  last: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  before: z.string().optional(),
});

export function makeRelayPaginationResponseSchema (schema: any) {
  return z.object({
    totalCount: z.number().optional().default(0),
    pageInfo: z.object({
      hasNextPage: z.boolean(),
      hasPreviousPage: z.boolean(),
      startCursor: z.string().nullable(),
      endCursor: z.string().nullable(),
    }),
    edges: z.array(z.object({
      node: schema,
      cursor: z.string(),
    })),
  })
};

export type IdInput = z.infer<typeof idValidationSchema>;
export type RequestQueryInput = z.infer<typeof requestQueryValidationSchema>;
export type RelayPaginationQueryInput = z.infer<typeof relayPaginationQueryValidationSchema>;