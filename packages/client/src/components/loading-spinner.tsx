import { Loader, Center, Stack, Text } from "@mantine/core";

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({
  message = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <Center h="50vh">
      <Stack align="center" gap="md">
        <Loader size="md" />
        <Text size="sm" c="dimmed">
          {message}
        </Text>
      </Stack>
    </Center>
  );
}
