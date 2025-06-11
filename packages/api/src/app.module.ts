import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";
import { APP_GUARD } from "@nestjs/core";
import { DatabaseModule } from "./db/db";
import { loggerOptions } from "./utils/logger.config";
import { ProjectsController } from "./controllers/projects.controller";
import { TasksController } from "./controllers/tasks.controller";
import { AuthController } from "./controllers/auth.controller";
import { ProjectsService } from "./services/projects.service";
import { TasksService } from "./services/tasks.service";
import { AuthService } from "./services/auth.service";
import { AuthGuard } from "./utils/auth.guard";

@Module({
  imports: [DatabaseModule, LoggerModule.forRoot(loggerOptions)],
  controllers: [ProjectsController, TasksController, AuthController],
  providers: [
    ProjectsService,
    TasksService,
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [],
})
export class AppModule {}
