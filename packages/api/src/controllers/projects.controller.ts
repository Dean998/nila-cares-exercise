import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  BadRequestException,
} from "@nestjs/common";
import { ProjectsService } from "../services/projects.service";
import { CreateProjectSchema } from "../dto/projects/create-project.dto";
import { UpdateProjectSchema } from "../dto/projects/update-project.dto";
import type { CreateProjectDto } from "../dto/projects/create-project.dto";
import type { UpdateProjectDto } from "../dto/projects/update-project.dto";
import { TypeBoxValidationPipe } from "../pipes/typebox-validation.pipe";

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async createProject(
    @Body(new TypeBoxValidationPipe(CreateProjectSchema))
    createProjectDto: CreateProjectDto
  ) {
    try {
      return await this.projectsService.createProject(createProjectDto);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  @Get()
  async getAllProjects() {
    return this.projectsService.getAllProjects();
  }

  @Get(":id")
  async getProjectById(@Param("id") id: number) {
    return this.projectsService.getProjectById(id);
  }

  @Patch(":id")
  async updateProject(
    @Param("id") id: number,
    @Body(new TypeBoxValidationPipe(UpdateProjectSchema))
    updateProjectDto: UpdateProjectDto
  ) {
    try {
      return await this.projectsService.updateProject(id, updateProjectDto);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  @Delete(":id")
  async deleteProject(@Param("id") id: number) {
    try {
      return await this.projectsService.deleteProject(id);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
}
