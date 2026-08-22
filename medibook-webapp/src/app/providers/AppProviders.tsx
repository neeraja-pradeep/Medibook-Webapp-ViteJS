import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';

import { ToastHost } from '@/shared/ui/toast/ToastHost';

import { router } from '@/app/router/routes';

/**
 * Server-state cache — idle during the static-seed phase (default options);
 * later sessions attach TanStack Query hooks to it without touching this file.
 */
const queryClient = new QueryClient();

/** Composition root: query cache + router + the global toast host. */
export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastHost />
    </QueryClientProvider>
  );
}
