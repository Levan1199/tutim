import { lazy, Suspense, useState } from "react";
import { apiRequest } from "./api.js";
import {
  readInterface,
  rememberInterface,
  routeForInterface,
} from "./uiPreference.js";

const ModernApp = lazy(() => import("./modern/ModernApp.jsx"));
const LegacyApp = lazy(() => import("./LegacyApp.jsx"));

export default function App() {
  const [mode, setMode] = useState(readInterface);
  const [switching, setSwitching] = useState(false);
  const switchInterface = async () => {
    if (switching) return;
    setSwitching(true);
    const next = mode === "modern" ? "legacy" : "modern";
    let user, courses;
    try {
      if (["/profile", "/connections"].includes(window.location.pathname))
        user = await apiRequest("profile");
      if (/^\/(courses|courseDetail)\//.test(window.location.pathname))
        courses = await apiRequest("course");
    } catch {
      // A list/home page remains available when the API cannot resolve a detail.
    }
    window.history.replaceState(
      null,
      "",
      routeForInterface(window.location, next, { user, courses }),
    );
    rememberInterface(next);
    setMode(next);
    setSwitching(false);
  };
  const Interface = mode === "modern" ? ModernApp : LegacyApp;
  return (
    <Suspense
      fallback={
        <div role="status" style={{ padding: 48, textAlign: "center" }}>
          Loading Tutim...
        </div>
      }
    >
      <Interface key={mode} onSwitchUI={switchInterface} />
    </Suspense>
  );
}
