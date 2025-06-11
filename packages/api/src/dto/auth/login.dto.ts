import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

export const LoginSchema = Type.Object({
  email: Type.String({
    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    description: "Valid email address",
  }),
  password: Type.String({ minLength: 6 }),
});

export type LoginDto = Static<typeof LoginSchema>;
