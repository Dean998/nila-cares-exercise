import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

export const CreateTaskSchema = Type.Object({
  title: Type.String(),
  description: Type.Optional(Type.String()),
  status: Type.Union([
    Type.Literal("todo"),
    Type.Literal("in_progress"),
    Type.Literal("done"),
  ]),
  priority: Type.Union([
    Type.Literal("low"),
    Type.Literal("medium"),
    Type.Literal("high"),
  ]),
});

export type CreateTaskDto = Static<typeof CreateTaskSchema>;
