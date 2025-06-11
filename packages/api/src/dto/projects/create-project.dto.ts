import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

export const CreateProjectSchema = Type.Object({
  name: Type.String(),
  description: Type.Optional(Type.String()),
});

export type CreateProjectDto = Static<typeof CreateProjectSchema>;
