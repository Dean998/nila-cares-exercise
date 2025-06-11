import { Injectable } from "@nestjs/common";
import { db } from "../db/db";
import { projects } from "../db/schemas";
import { eq } from "drizzle-orm";

@Injectable()
export class ProjectsService {
  async createProject(data: { name: string; description?: string }) {
    return db.insert(projects).values(data).returning();
  }

  async getAllProjects() {
    return db.select().from(projects);
  }

  async getProjectById(id: number) {
    return db.select().from(projects).where(eq(projects.id, id));
  }

  async deleteProject(id: number) {
    return db.delete(projects).where(eq(projects.id, id)).returning();
  }

  async updateProject(
    id: number,
    data: { name?: string; description?: string }
  ) {
    // First verify the project exists
    const existingProject = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (existingProject.length === 0) {
      throw new Error(`Project not found`);
    }

    const updateData: { name?: string; description?: string } = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (Object.keys(updateData).length === 0) {
      // Return the existing project if no valid fields are provided
      return existingProject;
    }

    return db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();
  }
}
