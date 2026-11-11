import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "antd/dist/reset.css";
import "./styles/main.css";
import "./i18n";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  // <React.StrictMode>  // ← Disabled to prevent double rendering and double console logs in development
    <App />
  // </React.StrictMode>
);
