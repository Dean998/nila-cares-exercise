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
import { authApi, LoginData } from "../utils/auth.api";
import { useAuthStore } from "../store/auth.store";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password.trim()) return;

    setIsLoading(true);
    try {
      const response = await authApi.login(formData);
      login(response.user);
      notifications.show({
        title: "Success",
        message: "Logged in successfully",
        color: "green",
      });
      navigate("/projects");
    } catch (error) {
      notifications.show({
        title: "Login Failed",
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
            Sign In to Nila Care
          </Title>

          <form onSubmit={handleSubmit}>
            <Stack>
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
                placeholder="Your password"
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
                disabled={!formData.email.trim() || !formData.password.trim()}
              >
                Sign In
              </Button>
            </Stack>
          </form>

          <Group justify="center" mt="md">
            <Text size="sm">
              Don't have an account?{" "}
              <Anchor onClick={() => navigate("/register")}>
                Create one here
              </Anchor>
            </Text>
          </Group>
        </Stack>
      </Card>
    </Container>
  );
}
