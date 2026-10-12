import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
// Remove the old CRA worker so it cannot serve stale bundles after upgrading.
if ("serviceWorker" in navigator)
  navigator.serviceWorker
    .getRegistrations()
    .then((list) => list.forEach((worker) => worker.unregister()));
