import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { prepareTelegramWebApp } from "./telegram";
import "./styles.css";

prepareTelegramWebApp();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
