import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "antd/dist/reset.css";
import "./styles/main.css";
import "./i18n";

// ==========================================
// 🛑 GLOBAL CONSOLE MANAGER
// ==========================================
// Set this to false to hide logs, set to true to see them again.
const SHOW_LOGS = false; 

if (!SHOW_LOGS) {
  // Save the original console.log in case you need it later
  const originalLog = console.log;
  
  // Override console.log to do nothing (or you could filter specific logs here)
  console.log = () => {};
  
  // Optional: Also hide console.info and console.debug if you want a completely clean console
  console.info = () => {};
  console.debug = () => {};
  
  // Note: I am leaving console.warn and console.error alone so you can still see actual errors!
}

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  // <React.StrictMode> 
    <App />
  // </React.StrictMode>
);
