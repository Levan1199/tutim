import { useState } from "react";
import { Provider } from "react-redux";
import AppRouter from "../AppRouter.jsx";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme.js";
import { createStore } from "./store.js";
import App from "./App.jsx";
import styles from "./styles.css?inline";
import InterfaceStyles from "../InterfaceStyles.jsx";

export default function ModernApp({ onSwitchUI }) {
  const [store] = useState(createStore);
  return (
    <Provider store={store}>
      <AppRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <InterfaceStyles mode="modern" css={styles} />
          <App onSwitchUI={onSwitchUI} />
        </ThemeProvider>
      </AppRouter>
    </Provider>
  );
}
