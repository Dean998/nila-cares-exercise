import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

export const UpdateTaskSchema = Type.Object({
  title: Type.Optional(Type.String({ minLength: 1 })),
  description: Type.Optional(Type.String()),
  status: Type.Optional(
    Type.Union([
      Type.Literal("todo"),
      Type.Literal("in_progress"),
      Type.Literal("done"),
    ])
  ),
  priority: Type.Optional(
    Type.Union([
      Type.Literal("low"),
      Type.Literal("medium"),
      Type.Literal("high"),
    ])
  ),
});

export type UpdateTaskDto = Static<typeof UpdateTaskSchema>;
