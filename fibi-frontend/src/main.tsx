import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

const container = document.getElementById("root")!;

/**
 * Prerendered pages arrive with markup already in `#root`, so they are
 * hydrated rather than re-rendered — re-rendering would throw away the HTML
 * the crawler was served and repaint the page for the user.
 *
 * The first client render matches the prerender because the auth and
 * membership providers both start logged-out: the session is read from
 * `localStorage` inside an effect, which runs after hydration completes.
 * Routes that were not prerendered (anything authenticated) still have an
 * empty container and take the plain client path.
 */
if (container.hasChildNodes()) {
  hydrateRoot(container, <App />);
} else {
  createRoot(container).render(<App />);
}
