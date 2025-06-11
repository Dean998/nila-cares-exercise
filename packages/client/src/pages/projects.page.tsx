import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconEye, IconPlus, IconTrash } from "../components/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, memo, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  CreateProjectData,
  UpdateProjectData,
  projectsApi,
  Project,
} from "../utils/projects.api";

export const ProjectsPage = memo(() => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [formData, setFormData] = useState<CreateProjectData>({
    name: "",
    description: "",
  });
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateProjectData>({
    name: "",
    description: "",
  });

  // Fetch projects
  const {
    data: projects = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.getAll,
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      close();
      setFormData({ name: "", description: "" });
      notifications.show({
        title: "Success",
        message: "Project created successfully",
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

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      notifications.show({
        title: "Success",
        message: "Project deleted successfully",
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

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProjectData }) =>
      projectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      closeEdit();
      setEditingProject(null);
      setEditFormData({ name: "", description: "" });
      notifications.show({
        title: "Success",
        message: "Project updated successfully",
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

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name.trim()) return;
      createProjectMutation.mutate(formData);
    },
    [formData, createProjectMutation]
  );

  const handleEditSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingProject || !editFormData.name?.trim()) return;
      updateProjectMutation.mutate({
        id: editingProject.id,
        data: editFormData,
      });
    },
    [editingProject, editFormData, updateProjectMutation]
  );

  const handleEdit = useCallback(
    (project: Project) => {
      setEditingProject(project);
      setEditFormData({
        name: project.name,
        description: project.description || "",
      });
      openEdit();
    },
    [openEdit]
  );

  const handleDelete = useCallback(
    (id: number) => {
      if (
        confirm(
          "Are you sure you want to delete this project? This will also delete all tasks in the project."
        )
      ) {
        deleteProjectMutation.mutate(id);
      }
    },
    [deleteProjectMutation]
  );

  if (error) {
    return (
      <Container>
        <Text color="red">Error loading projects: {error.message}</Text>
      </Container>
    );
  }

  return (
    <Container size="lg" px="xs">
      <Group justify="space-between" mb="xl" wrap="nowrap">
        <Title order={1}>Your Projects</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={open} size="sm">
          <Text hiddenFrom="sm">Create</Text>
          <Text visibleFrom="sm">Create Project</Text>
        </Button>
      </Group>

      {isLoading ? (
        <Text>Loading projects...</Text>
      ) : projects.length === 0 ? (
        <Card padding="xl" radius="md" withBorder>
          <Stack align="center">
            <Text size="lg" fw={500}>
              No projects yet
            </Text>
            <Text c="dimmed">Create your first project to get started</Text>
            <Button onClick={open}>Create Project</Button>
          </Stack>
        </Card>
      ) : (
        <Grid>
          {projects.map((project) => (
            <Grid.Col key={project.id} span={{ base: 12, sm: 6, lg: 4 }}>
              <Card padding="md" radius="md" withBorder h="100%">
                <Stack justify="space-between" h="100%">
                  <div>
                    <Group justify="space-between" mb="xs" wrap="nowrap">
                      <Text fw={500} size="lg" truncate flex={1}>
                        {project.name}
                      </Text>
                      <Group gap="xs" wrap="nowrap">
                        <ActionIcon
                          variant="subtle"
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(project);
                          }}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(project.id);
                          }}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>

                    {project.description && (
                      <Text size="sm" c="dimmed" mb="md" lineClamp={3}>
                        {project.description}
                      </Text>
                    )}
                  </div>

                  <Group justify="space-between">
                    <Badge variant="light" size="sm">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </Badge>
                    <Button
                      variant="light"
                      size="xs"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      View Tasks
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}

      {/* Create Project Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title="Create New Project"
        centered
      >
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Project Name"
              placeholder="Enter project name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <Textarea
              label="Description"
              placeholder="Enter project description (optional)"
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            <Group justify="flex-end">
              <Button variant="subtle" onClick={close}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createProjectMutation.isPending}
                disabled={!formData.name.trim()}
              >
                Create Project
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        opened={editOpened}
        onClose={closeEdit}
        title="Edit Project"
        centered
      >
        <form onSubmit={handleEditSubmit}>
          <Stack>
            <TextInput
              label="Project Name"
              placeholder="Enter project name"
              required
              value={editFormData.name}
              onChange={(e) =>
                setEditFormData({ ...editFormData, name: e.target.value })
              }
            />

            <Textarea
              label="Description"
              placeholder="Enter project description (optional)"
              rows={4}
              value={editFormData.description}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  description: e.target.value,
                })
              }
            />

            <Group justify="flex-end">
              <Button variant="subtle" onClick={closeEdit}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={updateProjectMutation.isPending}
                disabled={!editFormData.name?.trim()}
              >
                Update Project
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
});
