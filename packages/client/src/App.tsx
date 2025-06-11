import { ActionIcon, AppShell, Group, Image, Text } from "@mantine/core";
import { IconLogout } from "./components/icons";
import { Outlet, useNavigate } from "react-router";
import { HeaderMenu } from "./components/header.menu.tsx";
import { useAuthStore } from "./store/auth.store";
import { authApi } from "./utils/auth.api";
import { notifications } from "@mantine/notifications";
import { memo, useCallback } from "react";

export const App = memo(() => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = useCallback(async () => {
    try {
      await authApi.logout();
      logout();
      notifications.show({
        title: "Success",
        message: "Logged out successfully",
        color: "green",
      });
      navigate("/login");
    } catch (error) {
      logout();
      navigate("/login");
    }
  }, [logout, navigate]);

  const handleLogoClick = useCallback(() => {
    navigate("/projects");
  }, [navigate]);

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header px="md">
        <Group justify="space-between" h="100%" wrap="nowrap">
          <Image
            src="/logo.png"
            maw={100}
            onClick={handleLogoClick}
            style={{ cursor: "pointer" }}
          />
          <Group gap="xs" wrap="nowrap">
            {user && (
              <Text size="sm" fw={500} hiddenFrom="sm" truncate maw={80}>
                {user.name.split(" ")[0]}
              </Text>
            )}
            {user && (
              <Text size="sm" fw={500} visibleFrom="sm">
                Welcome, {user.name}
              </Text>
            )}
            <HeaderMenu />

            <ActionIcon
              size="sm"
              variant="transparent"
              onClick={handleLogout}
              title="Logout"
            >
              <IconLogout />
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
});
