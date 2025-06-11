import { Test, TestingModule } from "@nestjs/testing";
import { TasksService } from "./tasks.service";

// Mock all dependencies
jest.mock("../db/db", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    $dynamic: jest.fn().mockReturnThis(),
  },
}));

jest.mock("../db/schemas", () => ({
  tasks: {
    id: "tasks.id",
    projectId: "tasks.projectId",
    title: "tasks.title",
    description: "tasks.description",
    status: "tasks.status",
    priority: "tasks.priority",
    createdAt: "tasks.createdAt",
  },
  taskStatusEnum: { enumValues: ["todo", "in_progress", "done"] },
  taskPriorityEnum: { enumValues: ["low", "medium", "high"] },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn((field, value) => ({ field, value, operator: "eq" })),
  and: jest.fn((...conditions) => ({ conditions, operator: "and" })),
}));

describe("TasksService", () => {
  let service: TasksService;
  let mockDb: any;
  let mockTasks: any;
  let mockEq: any;
  let mockAnd: any;

  beforeEach(async () => {
    // Get the mocked modules
    const { db } = await import("../db/db");
    const { tasks } = await import("../db/schemas");
    const { eq, and } = await import("drizzle-orm");

    mockDb = db as any;
    mockTasks = tasks as any;
    mockEq = eq as any;
    mockAnd = and as any;

    jest.clearAllMocks();

    // Setup dynamic query mock
    const mockDynamicQuery = {
      where: jest.fn().mockReturnThis(),
      then: jest.fn((onFulfilled) => Promise.resolve([]).then(onFulfilled)),
    };
    mockDynamicQuery.where = jest.fn().mockReturnValue(mockDynamicQuery);
    mockDb.$dynamic.mockReturnValue(mockDynamicQuery);

    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createTask", () => {
    it("should create a task successfully", async () => {
      const projectId = 1;
      const taskData = {
        title: "Test Task",
        description: "Test Description",
        status: "todo",
        priority: "medium",
      };
      const expectedResult = [
        { id: 1, ...taskData, projectId, createdAt: new Date() },
      ];
      mockDb.returning.mockResolvedValueOnce(expectedResult);

      const result = await service.createTask(projectId, taskData);

      expect(result).toEqual(expectedResult);
      expect(mockDb.insert).toHaveBeenCalledWith(mockTasks);
      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          ...taskData,
          projectId,
        })
      );
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it("should throw an error for invalid status", async () => {
      const projectId = 1;
      const taskData = {
        title: "Test Task",
        status: "invalid_status",
        priority: "medium",
      };

      await expect(
        service.createTask(projectId, taskData as any)
      ).rejects.toThrow("Invalid status: invalid_status");
    });

    it("should throw an error for invalid priority", async () => {
      const projectId = 1;
      const taskData = {
        title: "Test Task",
        status: "todo",
        priority: "invalid_priority",
      };

      await expect(
        service.createTask(projectId, taskData as any)
      ).rejects.toThrow("Invalid priority: invalid_priority");
    });
  });

  describe("updateTask", () => {
    it("should update a task successfully", async () => {
      const projectId = 1;
      const taskId = 1;
      const updatePayload = { status: "in_progress", priority: "high" };
      const existingTask = { id: taskId, projectId, title: "Existing Task" };
      const expectedResult = [
        { id: taskId, projectId, ...updatePayload, title: "Existing Task" },
      ];

      // Mock the task exists check
      mockDb.limit.mockResolvedValueOnce([existingTask]);
      // Mock the update result
      mockDb.returning.mockResolvedValueOnce(expectedResult);

      const result = await service.updateTask(projectId, taskId, updatePayload);

      expect(result).toEqual(expectedResult);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(mockTasks);
      expect(mockDb.where).toHaveBeenCalledWith(
        mockAnd(
          mockEq(mockTasks.id, taskId),
          mockEq(mockTasks.projectId, projectId)
        )
      );
      expect(mockDb.limit).toHaveBeenCalledWith(1);
      expect(mockDb.update).toHaveBeenCalledWith(mockTasks);
      expect(mockDb.set).toHaveBeenCalledWith(updatePayload);
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it("should throw error if task not found in project", async () => {
      const projectId = 1;
      const taskId = 1;
      const updatePayload = { status: "in_progress" };

      // Mock task not found
      mockDb.limit.mockResolvedValueOnce([]);

      await expect(
        service.updateTask(projectId, taskId, updatePayload)
      ).rejects.toThrow("Task not found in project 1");

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(mockTasks);
      expect(mockDb.where).toHaveBeenCalledWith(
        mockAnd(
          mockEq(mockTasks.id, taskId),
          mockEq(mockTasks.projectId, projectId)
        )
      );
      expect(mockDb.limit).toHaveBeenCalledWith(1);
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it("should return existing task if no valid fields are provided for update", async () => {
      const projectId = 1;
      const taskId = 1;
      const existingTask = {
        id: taskId,
        projectId,
        title: "Old Task",
        status: "todo",
        priority: "low",
      };

      // Mock task exists
      mockDb.limit.mockResolvedValueOnce([existingTask]);

      const result = await service.updateTask(projectId, taskId, {});

      expect(result).toEqual([existingTask]);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(mockTasks);
      expect(mockDb.where).toHaveBeenCalledWith(
        mockAnd(
          mockEq(mockTasks.id, taskId),
          mockEq(mockTasks.projectId, projectId)
        )
      );
      expect(mockDb.limit).toHaveBeenCalledWith(1);
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it("should throw an error for invalid status on update", async () => {
      const projectId = 1;
      const taskId = 1;
      const updatePayload = { status: "invalid_status" };
      const existingTask = { id: taskId, projectId, title: "Existing Task" };

      // Mock task exists
      mockDb.limit.mockResolvedValueOnce([existingTask]);

      await expect(
        service.updateTask(projectId, taskId, updatePayload as any)
      ).rejects.toThrow("Invalid status: invalid_status");
    });

    it("should throw an error for invalid priority on update", async () => {
      const projectId = 1;
      const taskId = 1;
      const updatePayload = { priority: "invalid_priority" };
      const existingTask = { id: taskId, projectId, title: "Existing Task" };

      // Mock task exists
      mockDb.limit.mockResolvedValueOnce([existingTask]);

      await expect(
        service.updateTask(projectId, taskId, updatePayload as any)
      ).rejects.toThrow("Invalid priority: invalid_priority");
    });
  });

  describe("deleteTask", () => {
    it("should delete a task successfully", async () => {
      const projectId = 1;
      const taskId = 1;
      const existingTask = { id: taskId, projectId, title: "Task to delete" };
      const expectedResult = [existingTask];

      // Mock task exists
      mockDb.limit.mockResolvedValueOnce([existingTask]);
      // Mock delete result
      mockDb.returning.mockResolvedValueOnce(expectedResult);

      const result = await service.deleteTask(projectId, taskId);

      expect(result).toEqual(expectedResult);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(mockTasks);
      expect(mockDb.where).toHaveBeenCalledWith(
        mockAnd(
          mockEq(mockTasks.id, taskId),
          mockEq(mockTasks.projectId, projectId)
        )
      );
      expect(mockDb.limit).toHaveBeenCalledWith(1);
      expect(mockDb.delete).toHaveBeenCalledWith(mockTasks);
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it("should throw error if task not found in project for deletion", async () => {
      const projectId = 1;
      const taskId = 1;

      // Mock task not found
      mockDb.limit.mockResolvedValueOnce([]);

      await expect(service.deleteTask(projectId, taskId)).rejects.toThrow(
        "Task not found in project 1"
      );

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(mockTasks);
      expect(mockDb.where).toHaveBeenCalledWith(
        mockAnd(
          mockEq(mockTasks.id, taskId),
          mockEq(mockTasks.projectId, projectId)
        )
      );
      expect(mockDb.limit).toHaveBeenCalledWith(1);
      expect(mockDb.delete).not.toHaveBeenCalled();
    });
  });

  describe("filterTasks", () => {
    it("should filter tasks by status", async () => {
      const filter = { status: "todo" };
      const expectedTasks = [{ id: 1, status: "todo", priority: "low" }];

      const mockDynamicQuery = {
        where: jest.fn().mockReturnThis(),
        then: jest.fn((onFulfilled) =>
          Promise.resolve(expectedTasks).then(onFulfilled)
        ),
      };
      mockDynamicQuery.where = jest.fn().mockReturnValue(mockDynamicQuery);
      mockDb.$dynamic.mockReturnValue(mockDynamicQuery);

      const result = await service.filterTasks(filter);

      expect(result).toEqual(expectedTasks);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(mockTasks);
      expect(mockDb.$dynamic).toHaveBeenCalled();
      expect(mockDynamicQuery.where).toHaveBeenCalledWith(
        mockEq(mockTasks.status, filter.status)
      );
    });

    it("should filter tasks by priority", async () => {
      const filter = { priority: "high" };
      const expectedTasks = [
        { id: 2, status: "in_progress", priority: "high" },
      ];

      const mockDynamicQuery = {
        where: jest.fn().mockReturnThis(),
        then: jest.fn((onFulfilled) =>
          Promise.resolve(expectedTasks).then(onFulfilled)
        ),
      };
      mockDynamicQuery.where = jest.fn().mockReturnValue(mockDynamicQuery);
      mockDb.$dynamic.mockReturnValue(mockDynamicQuery);

      const result = await service.filterTasks(filter);

      expect(result).toEqual(expectedTasks);
      expect(mockDynamicQuery.where).toHaveBeenCalledWith(
        mockEq(mockTasks.priority, filter.priority)
      );
    });

    it("should filter tasks by status and priority", async () => {
      const filter = { status: "done", priority: "medium" };
      const expectedTasks = [{ id: 3, status: "done", priority: "medium" }];

      const mockDynamicQuery = {
        where: jest.fn().mockReturnThis(),
        then: jest.fn((onFulfilled) =>
          Promise.resolve(expectedTasks).then(onFulfilled)
        ),
      };
      mockDynamicQuery.where = jest.fn().mockReturnValue(mockDynamicQuery);
      mockDb.$dynamic.mockReturnValue(mockDynamicQuery);

      const result = await service.filterTasks(filter);

      expect(result).toEqual(expectedTasks);
      expect(mockDynamicQuery.where).toHaveBeenCalledWith(
        mockEq(mockTasks.status, filter.status)
      );
      expect(mockDynamicQuery.where).toHaveBeenCalledWith(
        mockEq(mockTasks.priority, filter.priority)
      );
      expect(mockDynamicQuery.where).toHaveBeenCalledTimes(2);
    });

    it("should return all tasks if no filters are provided", async () => {
      const expectedTasks = [{ id: 1 }, { id: 2 }];
      const mockDynamicQuery = {
        where: jest.fn().mockReturnThis(),
        then: jest.fn((onFulfilled) =>
          Promise.resolve(expectedTasks).then(onFulfilled)
        ),
      };
      mockDynamicQuery.where = jest.fn().mockReturnValue(mockDynamicQuery);
      mockDb.$dynamic.mockReturnValue(mockDynamicQuery);

      const result = await service.filterTasks({});

      expect(result).toEqual(expectedTasks);
      expect(mockDynamicQuery.where).not.toHaveBeenCalled();
    });
  });
});
