import { BrowserRouter, HashRouter } from "react-router-dom";
import { isDemo } from "./runtime.js";

export default function AppRouter({ children }) {
  const Router = isDemo ? HashRouter : BrowserRouter;
  return <Router>{children}</Router>;
}
