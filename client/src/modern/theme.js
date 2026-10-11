import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: { main: "#245c48", dark: "#193e32", light: "#e6f0e8" },
    secondary: { main: "#bd5b40", dark: "#97432c", light: "#f9e7df" },
    background: { default: "#faf9f5", paper: "#ffffff" },
    text: { primary: "#222e29", secondary: "#637068" },
    divider: "#e5e8df",
    success: { main: "#326c4c" },
  },
  typography: {
    fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
    h1: { fontWeight: 750, letterSpacing: "-0.055em", lineHeight: 1.07 },
    h3: { fontWeight: 750, letterSpacing: "-0.045em", lineHeight: 1.15 },
    h4: { fontWeight: 700, letterSpacing: "-0.035em" },
    h5: { fontWeight: 700, letterSpacing: "-0.025em" },
    h6: { fontWeight: 700, letterSpacing: "-0.015em" },
    body1: { lineHeight: 1.7 },
    button: { fontWeight: 650 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: "none",
          minHeight: 44,
          borderRadius: 12,
          padding: "10px 18px",
        },
        sizeLarge: { minHeight: 52, padding: "14px 24px" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #e5e8df",
          boxShadow: "0 5px 20px #213d2910",
          borderRadius: 20,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: { padding: 24, "&:last-child": { paddingBottom: 24 } },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: "#fff", borderRadius: 12 },
        notchedOutline: { borderColor: "#d6dcd3" },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600, borderRadius: 8 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 24 } } },
    MuiTableCell: {
      styleOverrides: {
        head: { background: "#f3f6ef", fontWeight: 700 },
        root: { borderColor: "#e5e8df", padding: 18 },
      },
    },
    MuiAlert: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiContainer: { defaultProps: { maxWidth: "lg" } },
  },
});
