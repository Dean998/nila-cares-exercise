import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

export const UpdateProjectSchema = Type.Object({
  name: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
});

export type UpdateProjectDto = Static<typeof UpdateProjectSchema>;
