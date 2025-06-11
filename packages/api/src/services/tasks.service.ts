import { Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { db } from "../db/db";
import { tasks } from "../db/schemas";

const taskStatusValues = ["todo", "in_progress", "done"] as const;
const taskPriorityValues = ["low", "medium", "high"] as const;

type TaskStatus = (typeof taskStatusValues)[number];
type TaskPriority = (typeof taskPriorityValues)[number];

@Injectable()
export class TasksService {
  async createTask(
    projectId: number,
    data: {
      title: string;
      description?: string;
      status: string;
      priority: string;
    }
  ) {
    // Ensure status and priority are valid enum members before insertion
    if (!(taskStatusValues as readonly string[]).includes(data.status)) {
      throw new Error(`Invalid status: ${data.status}`);
    }
    if (!(taskPriorityValues as readonly string[]).includes(data.priority)) {
      throw new Error(`Invalid priority: ${data.priority}`);
    }

    return db
      .insert(tasks)
      .values({
        ...data,
        projectId,
        status: data.status as TaskStatus,
        priority: data.priority as TaskPriority,
      })
      .returning();
  }

  async updateTask(
    projectId: number,
    id: number,
    data: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
    }
  ) {
    // First verify the task belongs to the specified project
    const existingTask = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.projectId, projectId)))
      .limit(1);

    if (existingTask.length === 0) {
      throw new Error(`Task not found in project ${projectId}`);
    }

    const updateData: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
    } = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (data.status) {
      if (!(taskStatusValues as readonly string[]).includes(data.status)) {
        throw new Error(`Invalid status: ${data.status}`);
      }
      updateData.status = data.status as TaskStatus;
    }

    if (data.priority) {
      if (!(taskPriorityValues as readonly string[]).includes(data.priority)) {
        throw new Error(`Invalid priority: ${data.priority}`);
      }
      updateData.priority = data.priority as TaskPriority;
    }

    if (Object.keys(updateData).length === 0) {
      // Return the existing task if no valid fields are provided
      return existingTask;
    }

    return db
      .update(tasks)
      .set(updateData)
      .where(and(eq(tasks.id, id), eq(tasks.projectId, projectId)))
      .returning();
  }

  async deleteTask(projectId: number, id: number) {
    // First verify the task belongs to the specified project
    const existingTask = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.projectId, projectId)))
      .limit(1);

    if (existingTask.length === 0) {
      throw new Error(`Task not found in project ${projectId}`);
    }

    return db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.projectId, projectId)))
      .returning();
  }

  async getProjectTasks(
    projectId: number,
    filters: { status?: string; priority?: string }
  ) {
    let query = db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId))
      .$dynamic();

    if (
      filters.status &&
      (taskStatusValues as readonly string[]).includes(filters.status)
    ) {
      query = query.where(
        and(
          eq(tasks.projectId, projectId),
          eq(tasks.status, filters.status as TaskStatus)
        )
      );
    }

    if (
      filters.priority &&
      (taskPriorityValues as readonly string[]).includes(filters.priority)
    ) {
      query = query.where(
        and(
          eq(tasks.projectId, projectId),
          eq(tasks.priority, filters.priority as TaskPriority)
        )
      );
    }

    return query;
  }

  async filterTasks(filters: { status?: string; priority?: string }) {
    let query = db.select().from(tasks).$dynamic(); // Use $dynamic() for conditional query building

    if (
      filters.status &&
      (taskStatusValues as readonly string[]).includes(filters.status)
    ) {
      query = query.where(eq(tasks.status, filters.status as TaskStatus));
    }

    if (
      filters.priority &&
      (taskPriorityValues as readonly string[]).includes(filters.priority)
    ) {
      query = query.where(eq(tasks.priority, filters.priority as TaskPriority));
    }

    return query;
  }
}
