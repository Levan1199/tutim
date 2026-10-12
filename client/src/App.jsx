import { lazy, Suspense, useState } from "react";
import { apiRequest } from "./api.js";
import { appLocation, replaceAppRoute, isDemo } from "./runtime.js";
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
    const location = appLocation();
    try {
      if (["/profile", "/connections"].includes(location.pathname))
        user = await apiRequest("profile");
      if (/^\/(courses|courseDetail)\//.test(location.pathname))
        courses = await apiRequest("course");
    } catch {
      // A list/home page remains available when the API cannot resolve a detail.
    }
    replaceAppRoute(routeForInterface(location, next, { user, courses }));
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
      {isDemo && (
        <aside
          aria-label="Demo notice"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1500,
            background: "#244b40",
            color: "white",
            padding: "12px 20px",
            textAlign: "center",
            font: "14px/1.5 system-ui, sans-serif",
            boxShadow: "0 -2px 12px #0002",
          }}
        >
          Read-only demo · All profiles and reviews are fictional. Sign-in and
          changes are disabled.
        </aside>
      )}
      <div style={isDemo ? { paddingBottom: 72 } : undefined}>
        <Interface key={mode} onSwitchUI={switchInterface} />
      </div>
    </Suspense>
  );
}
