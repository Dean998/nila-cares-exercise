import { useState } from "react";
import {
  Container,
  Card,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Group,
  Stack,
  Anchor,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router";
import { authApi, RegisterData } from "../utils/auth.api";
import { useAuthStore } from "../store/auth.store";

export function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    password: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.name.trim()
    ) {
      notifications.show({
        title: "Validation Error",
        message: "All fields are required",
        color: "red",
      });
      return;
    }

    if (formData.password.length < 6) {
      notifications.show({
        title: "Validation Error",
        message: "Password must be at least 6 characters long",
        color: "red",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.register(formData);
      login(response.user);
      notifications.show({
        title: "Success",
        message: "Account created successfully! Welcome!",
        color: "green",
      });
      navigate("/projects");
    } catch (error) {
      notifications.show({
        title: "Registration Failed",
        message: error instanceof Error ? error.message : "Unknown error",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="xs" py="xl" px="xs">
      <Card withBorder shadow="md" p="xl" radius="md">
        <Stack>
          <Title order={2} ta="center" mb="md" size="h3">
            Create Your Account
          </Title>

          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput
                label="Full Name"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <TextInput
                label="Email"
                placeholder="your@email.com"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />

              <PasswordInput
                label="Password"
                placeholder="Your password (min 6 characters)"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />

              <Button
                type="submit"
                fullWidth
                loading={isLoading}
                disabled={
                  !formData.email.trim() ||
                  !formData.password.trim() ||
                  !formData.name.trim()
                }
              >
                Create Account
              </Button>
            </Stack>
          </form>

          <Group justify="center" mt="md">
            <Text size="sm">
              Already have an account?{" "}
              <Anchor onClick={() => navigate("/login")}>Sign in here</Anchor>
            </Text>
          </Group>
        </Stack>
      </Card>
    </Container>
  );
}
