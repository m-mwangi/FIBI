import { createBrowserRouter } from 'react-router';
import { routeConfig } from './routeConfig';

/**
 * Browser-only router instance.
 *
 * Import this from client code only. Node-side tooling (the prerenderer)
 * imports `routeConfig` directly — see the note in `routeConfig.tsx`.
 */
export const router = createBrowserRouter(routeConfig);
