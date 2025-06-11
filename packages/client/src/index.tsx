import { App } from "./App.tsx";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  type RouteObject,
  RouterProvider,
} from "react-router";

// Import CSS in optimal order
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

import { createTheme, MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Notifications } from "@mantine/notifications";
import { AuthProvider } from "./components/auth-provider.tsx";
import { ProtectedRoute } from "./components/protected-route.tsx";
import { LoadingSpinner } from "./components/loading-spinner.tsx";

// Lazy load pages for better performance
import { lazy, Suspense } from "react";

const ProjectsPage = lazy(() =>
  import("./pages/projects.page.tsx").then((m) => ({ default: m.ProjectsPage }))
);
const ProjectDetailPage = lazy(() =>
  import("./pages/project-detail.page.tsx").then((m) => ({
    default: m.ProjectDetailPage,
  }))
);
const LoginPage = lazy(() =>
  import("./pages/login.page.tsx").then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import("./pages/register.page.tsx").then((m) => ({ default: m.RegisterPage }))
);

const myColor = [
  "#edf3ff",
  "#dae2f4",
  "#b3c2e6",
  "#8aa0d8",
  "#6783cc",
  "#5171c6",
  "#4568c4",
  "#3658ad",
  "#2e4e9c",
  "#21438a",
] as const;

const alt = [
  "#fff6eb",
  "#fcead5",
  "#fbd2a3",
  "#fbb96e",
  "#fba443",
  "#fb962a",
  "#fb901f",
  "#e07c14",
  "#c76e0d",
  "#ad5d00",
] as const;

const theme = createTheme({
  fontFamily: "Geist, sans-serif",
  focusRing: "never",
  colors: {
    main: myColor,
    alt: alt,
  },
  primaryColor: "main",
  primaryShade: 8,
  defaultRadius: "md",
});

type RouteConfig = RouteObject & {
  children?: RouteConfig[];
  isPublic?: boolean;
};

const routesConfig: RouteConfig[] = [
  // Public routes
  {
    path: "/login",
    element: (
      <Suspense fallback={<LoadingSpinner message="Loading login..." />}>
        <LoginPage />
      </Suspense>
    ),
    isPublic: true,
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<LoadingSpinner message="Loading registration..." />}>
        <RegisterPage />
      </Suspense>
    ),
    isPublic: true,
  },
  // Protected routes
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    errorElement: <div>Something went wrong!</div>,
    children: [
      {
        path: "",
        element: (
          <Suspense fallback={<LoadingSpinner message="Loading projects..." />}>
            <ProjectsPage />
          </Suspense>
        ),
      },
      {
        path: "projects",
        element: (
          <Suspense fallback={<LoadingSpinner message="Loading projects..." />}>
            <ProjectsPage />
          </Suspense>
        ),
      },
      {
        path: "projects/:id",
        element: (
          <Suspense
            fallback={<LoadingSpinner message="Loading project details..." />}
          >
            <ProjectDetailPage />
          </Suspense>
        ),
      },
    ],
  },
];

const router = createBrowserRouter(routesConfig);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <MantineProvider theme={theme}>
      <AuthProvider>
        <Notifications position={"top-right"} transitionDuration={300} />
        <RouterProvider router={router} />
      </AuthProvider>
    </MantineProvider>
  </QueryClientProvider>
);
