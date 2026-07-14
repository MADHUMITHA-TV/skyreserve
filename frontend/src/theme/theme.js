import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0B3C5D",
    },
    secondary: {
      main: "#D4AF37",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    success: {
      main: "#2E7D32",
    },
    error: {
      main: "#D32F2F",
    },
    text: {
      primary: "#1E293B",
      secondary: "#64748B",
    },
  },

  typography: {
    fontFamily: "'Poppins', sans-serif",

    h1: {
      fontSize: "3.5rem",
      fontWeight: 700,
    },

    h2: {
      fontSize: "2.5rem",
      fontWeight: 700,
    },

    h3: {
      fontSize: "2rem",
      fontWeight: 600,
    },

    h4: {
      fontSize: "1.6rem",
      fontWeight: 600,
    },

    h5: {
      fontSize: "1.3rem",
      fontWeight: 600,
    },

    body1: {
      fontSize: "1rem",
    },

    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "10px 22px",
          boxShadow: "none",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        },
      },
    },
  },
});

export default theme;