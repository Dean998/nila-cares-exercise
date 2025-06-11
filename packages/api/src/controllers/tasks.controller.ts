import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { TasksService } from "../services/tasks.service";
import { CreateTaskSchema } from "../dto/tasks/create-task.dto";
import { UpdateTaskSchema } from "../dto/tasks/update-task.dto";
import type { CreateTaskDto } from "../dto/tasks/create-task.dto";
import type { UpdateTaskDto } from "../dto/tasks/update-task.dto";
import { TypeBoxValidationPipe } from "../pipes/typebox-validation.pipe";

@Controller("projects/:projectId/tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getProjectTasks(
    @Param("projectId") projectId: number,
    @Query("status") status?: string,
    @Query("priority") priority?: string
  ) {
    return this.tasksService.getProjectTasks(projectId, { status, priority });
  }

  @Post()
  async createTask(
    @Param("projectId") projectId: number,
    @Body(new TypeBoxValidationPipe(CreateTaskSchema))
    createTaskDto: CreateTaskDto
  ) {
    try {
      return await this.tasksService.createTask(projectId, createTaskDto);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  @Patch(":id")
  async updateTask(
    @Param("projectId") projectId: number,
    @Param("id") id: number,
    @Body(new TypeBoxValidationPipe(UpdateTaskSchema))
    updateTaskDto: UpdateTaskDto
  ) {
    try {
      return await this.tasksService.updateTask(projectId, id, updateTaskDto);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  @Delete(":id")
  async deleteTask(
    @Param("projectId") projectId: number,
    @Param("id") id: number
  ) {
    try {
      return await this.tasksService.deleteTask(projectId, id);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
}
