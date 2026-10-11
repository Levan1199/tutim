import { useLayoutEffect } from "react";

// Attach only the active interface's global CSS, including its portal styles.
export default function InterfaceStyles({ mode, css }) {
  useLayoutEffect(() => {
    const style = document.createElement("style");
    style.dataset.tutimUi = mode;
    style.textContent = css;
    document.head.append(style);
    document.documentElement.dataset.tutimUi = mode;
    return () => {
      style.remove();
      delete document.documentElement.dataset.tutimUi;
    };
  }, [mode, css]);
  return null;
}
