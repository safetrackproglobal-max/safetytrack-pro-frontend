import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "antd/dist/reset.css";
import "./styles/main.css";
import "./i18n";

// ==========================================
// 🛑 GLOBAL CONSOLE SILENCER
// ==========================================
// Set this to true when you actually want to debug
const SHOW_LOGS = false; 

if (!SHOW_LOGS) {
  const noop = () => {}; // Empty function
  
  // Silence standard logs
  console.log = noop;
  console.info = noop;
  console.debug = noop;
  console.warn = noop; // Hides custom warnings
  
  // Note: I am NOT overriding console.error, 
  // so you will still see red error messages if the app crashes.
}

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  // <React.StrictMode> 
    <App />
  // </React.StrictMode>
);
