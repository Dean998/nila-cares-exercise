import { useState } from "react";
import {
  Container,
  Title,
  Button,
  Card,
  Text,
  Group,
  Stack,
  Modal,
  TextInput,
  Textarea,
  Select,
  Badge,
  ActionIcon,
  Menu,
  Grid,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconDots, IconGripVertical } from "../components/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router";
import { notifications } from "@mantine/notifications";
import classes from "./project-detail.module.css";
import { projectsApi } from "../utils/projects.api";
import {
  tasksApi,
  Task,
  CreateTaskData,
  UpdateTaskData,
} from "../utils/tasks.api";

const statusColors = {
  todo: "gray",
  in_progress: "blue",
  done: "green",
};

const priorityColors = {
  low: "gray",
  medium: "yellow",
  high: "red",
};

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState<CreateTaskData>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
  });

  const [editFormData, setEditFormData] = useState<UpdateTaskData>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
  });

  if (!id) {
    navigate("/projects");
    return null;
  }

  // Fetch project
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsApi.getById(Number(id)),
  });

  // Fetch tasks with filters for this specific project
  const { data: projectTasks = [] } = useQuery({
    queryKey: ["tasks", id, statusFilter, priorityFilter],
    queryFn: () => tasksApi.getByProjectId(Number(id)),
    select: (tasks) => {
      // Apply client-side filtering since the backend doesn't support query params yet
      return tasks.filter((task) => {
        if (statusFilter && task.status !== statusFilter) return false;
        if (priorityFilter && task.priority !== priorityFilter) return false;
        return true;
      });
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskData) => tasksApi.create(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", id] });
      close();
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
      });
      notifications.show({
        title: "Success",
        message: "Task created successfully",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id: taskId, data }: { id: number; data: UpdateTaskData }) =>
      tasksApi.update(Number(id), taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", id] });
      notifications.show({
        title: "Success",
        message: "Task updated successfully",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    },
  });

  // Edit task mutation (now uses the same update function)
  const editTaskMutation = useMutation({
    mutationFn: ({ id: taskId, data }: { id: number; data: UpdateTaskData }) =>
      tasksApi.update(Number(id), taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", id] });
      closeEdit();
      setEditFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
      });
      notifications.show({
        title: "Success",
        message: "Task updated successfully",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) => tasksApi.delete(Number(id), taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", id] });
      notifications.show({
        title: "Success",
        message: "Task deleted successfully",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    createTaskMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editFormData.title?.trim()) return;
    editTaskMutation.mutate({ id: editingTask.id, data: editFormData });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditFormData({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
    });
    openEdit();
  };

  const handleDeleteTask = (taskId: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleStatusUpdate = (taskId: number, status: Task["status"]) => {
    updateTaskMutation.mutate({ id: taskId, data: { status } });
  };

  const handlePriorityUpdate = (taskId: number, priority: Task["priority"]) => {
    updateTaskMutation.mutate({ id: taskId, data: { priority } });
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id.toString());
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedOver(null);
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDraggedOver(status);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear draggedOver if we're actually leaving the drop zone
    // and not just moving to a child element
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDraggedOver(null);
    }
  };

  const handleDrop = (e: React.DragEvent, newStatus: Task["status"]) => {
    e.preventDefault();
    setDraggedOver(null);

    if (draggedTask && draggedTask.status !== newStatus) {
      handleStatusUpdate(draggedTask.id, newStatus);
    }
    setDraggedTask(null);
  };

  // Group tasks by status
  const tasksByStatus = {
    todo: projectTasks.filter((task) => task.status === "todo"),
    in_progress: projectTasks.filter((task) => task.status === "in_progress"),
    done: projectTasks.filter((task) => task.status === "done"),
  };

  if (projectLoading) return <Text>Loading project...</Text>;
  if (!project) return <Text>Project not found</Text>;

  return (
    <Container size="xl" px="xs">
      {/* Header */}
      <Stack mb="xl">
        <Button
          variant="subtle"
          onClick={() => navigate("/projects")}
          w="fit-content"
          size="sm"
        >
          ← Back to Projects
        </Button>

        <Group justify="space-between" wrap="nowrap">
          <div style={{ flex: 1, minWidth: 0 }}>
            <Title order={1} size="h2">
              {project.name}
            </Title>
            {project.description && (
              <Text c="dimmed" mt="xs" size="sm" lineClamp={2}>
                {project.description}
              </Text>
            )}
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={open} size="sm">
            <Text hiddenFrom="sm">Add</Text>
            <Text visibleFrom="sm">Add Task</Text>
          </Button>
        </Group>
      </Stack>

      {/* Filters */}
      <Card mb="xl" p="sm">
        <Stack gap="sm">
          <Text fw={500} size="sm">
            Filters:
          </Text>
          <Group grow>
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value || "")}
              data={[
                { value: "", label: "All Statuses" },
                { value: "todo", label: "To Do" },
                { value: "in_progress", label: "In Progress" },
                { value: "done", label: "Done" },
              ]}
              clearable
              size="sm"
            />
            <Select
              placeholder="Filter by priority"
              value={priorityFilter}
              onChange={(value) => setPriorityFilter(value || "")}
              data={[
                { value: "", label: "All Priorities" },
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ]}
              clearable
              size="sm"
            />
          </Group>
        </Stack>
      </Card>

      {/* Tasks by Status */}
      {draggedTask && (
        <Card
          mb="md"
          p="sm"
          style={{ backgroundColor: "#e3f2fd", border: "1px solid #2196f3" }}
        >
          <Text size="sm" c="blue" ta="center">
            💡 Drag the task "{draggedTask.title}" to a different column to
            change its status
          </Text>
        </Card>
      )}

      <Grid gutter="sm">
        {Object.entries(tasksByStatus).map(([status, tasks]) => (
          <Grid.Col key={status} span={{ base: 12, sm: 12, md: 4 }}>
            <Card
              withBorder
              h={{ base: "auto", md: "600px" }}
              className={`${classes.dropZone} ${
                draggedOver === status ? classes.dropZoneActive : ""
              }`}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status as Task["status"])}
              p="sm"
            >
              <Group justify="space-between" mb="sm">
                <Title order={4} tt="capitalize" size="h5">
                  {status.replace("_", " ")} ({tasks.length})
                </Title>
                <Badge
                  color={statusColors[status as keyof typeof statusColors]}
                  size="sm"
                >
                  {status.replace("_", " ")}
                </Badge>
              </Group>

              <Stack gap="xs" style={{ minHeight: "200px" }}>
                {tasks.map((task) => (
                  <Card
                    key={task.id}
                    padding="xs"
                    withBorder
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.stopPropagation()}
                    className={`${classes.taskCard} ${
                      draggedTask?.id === task.id ? classes.draggedTask : ""
                    }`}
                  >
                    <Group justify="space-between" mb="xs" wrap="nowrap">
                      <Group gap="xs" flex={1} miw={0}>
                        <IconGripVertical
                          size={12}
                          className={classes.gripIcon}
                        />
                        <Text fw={500} size="sm" lineClamp={1} flex={1}>
                          {task.title}
                        </Text>
                      </Group>
                      <Menu>
                        <Menu.Target>
                          <ActionIcon size="xs" variant="subtle">
                            <IconDots size={12} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item onClick={() => handleEditTask(task)}>
                            Edit Task
                          </Menu.Item>

                          <Menu.Divider />
                          <Menu.Label>Update Status</Menu.Label>
                          <Menu.Item
                            onClick={() => handleStatusUpdate(task.id, "todo")}
                          >
                            To Do
                          </Menu.Item>
                          <Menu.Item
                            onClick={() =>
                              handleStatusUpdate(task.id, "in_progress")
                            }
                          >
                            In Progress
                          </Menu.Item>
                          <Menu.Item
                            onClick={() => handleStatusUpdate(task.id, "done")}
                          >
                            Done
                          </Menu.Item>

                          <Menu.Divider />
                          <Menu.Label>Update Priority</Menu.Label>
                          <Menu.Item
                            onClick={() => handlePriorityUpdate(task.id, "low")}
                          >
                            Low
                          </Menu.Item>
                          <Menu.Item
                            onClick={() =>
                              handlePriorityUpdate(task.id, "medium")
                            }
                          >
                            Medium
                          </Menu.Item>
                          <Menu.Item
                            onClick={() =>
                              handlePriorityUpdate(task.id, "high")
                            }
                          >
                            High
                          </Menu.Item>

                          <Menu.Divider />
                          <Menu.Label>Task Actions</Menu.Label>
                          <Menu.Item
                            color="red"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            Delete Task
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>

                    {task.description && (
                      <Text size="xs" c="dimmed" mb="xs" lineClamp={1}>
                        {task.description}
                      </Text>
                    )}

                    <Group justify="space-between" wrap="nowrap">
                      <Badge
                        size="xs"
                        color={priorityColors[task.priority]}
                        tt="capitalize"
                      >
                        {task.priority}
                      </Badge>
                      <Text size="xs" c="dimmed" hiddenFrom="sm">
                        {new Date(task.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                      <Text size="xs" c="dimmed" visibleFrom="sm">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </Text>
                    </Group>
                  </Card>
                ))}

                {/* Drop zone indicator when column is empty */}
                {tasks.length === 0 && draggedTask && (
                  <Box
                    className={`${classes.emptyDropZone} ${
                      draggedOver === status ? classes.dropZoneActive : ""
                    }`}
                  >
                    Drop "{draggedTask.title}" here
                  </Box>
                )}
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {/* Create Task Modal */}
      <Modal opened={opened} onClose={close} title="Add New Task" centered>
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Task Title"
              placeholder="Enter task title"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />

            <Textarea
              label="Description"
              placeholder="Enter task description (optional)"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(value) =>
                setFormData({ ...formData, status: value as Task["status"] })
              }
              data={[
                { value: "todo", label: "To Do" },
                { value: "in_progress", label: "In Progress" },
                { value: "done", label: "Done" },
              ]}
            />

            <Select
              label="Priority"
              value={formData.priority}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  priority: value as Task["priority"],
                })
              }
              data={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ]}
            />

            <Group justify="flex-end">
              <Button variant="subtle" onClick={close}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createTaskMutation.isPending}
                disabled={!formData.title.trim()}
              >
                Add Task
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal opened={editOpened} onClose={closeEdit} title="Edit Task" centered>
        <form onSubmit={handleEditSubmit}>
          <Stack>
            <TextInput
              label="Task Title"
              placeholder="Enter task title"
              required
              value={editFormData.title}
              onChange={(e) =>
                setEditFormData({ ...editFormData, title: e.target.value })
              }
            />

            <Textarea
              label="Description"
              placeholder="Enter task description (optional)"
              rows={3}
              value={editFormData.description}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  description: e.target.value,
                })
              }
            />

            <Select
              label="Status"
              value={editFormData.status}
              onChange={(value) =>
                setEditFormData({
                  ...editFormData,
                  status: value as Task["status"],
                })
              }
              data={[
                { value: "todo", label: "To Do" },
                { value: "in_progress", label: "In Progress" },
                { value: "done", label: "Done" },
              ]}
            />

            <Select
              label="Priority"
              value={editFormData.priority}
              onChange={(value) =>
                setEditFormData({
                  ...editFormData,
                  priority: value as Task["priority"],
                })
              }
              data={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ]}
            />

            <Group justify="flex-end">
              <Button variant="subtle" onClick={closeEdit}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={editTaskMutation.isPending}
                disabled={!editFormData.title?.trim()}
              >
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
