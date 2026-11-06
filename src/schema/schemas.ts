import { z } from "zod";

const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(100)
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscore allowed"),
  email: z.string().trim().toLowerCase().email().max(100),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const createPostSchema = z.object({
  title: z.string().trim().min(1).max(100),
  body: z.string().trim().min(1).max(5000),
  status: z.enum(["draft", "published"]).default("published"),
});

const updatePostSchema = z
  .object({
    title: z.string().trim().min(1).max(100).optional(),
    body: z.string().trim().min(1).max(5000).optional(),
    status: z.enum(["draft", "published"]).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Provide at least one field to update" });

  const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
export{
  signupSchema,
  loginSchema,
  idParamSchema,
  createPostSchema,
  updatePostSchema,
  paginationSchema,
};