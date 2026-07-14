import { Paper } from "@mui/material";

export default function AuthCard({ children }) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 520,
        p: 5,
        borderRadius: 6,

        background:
          "rgba(255,255,255,0.85)",

        backdropFilter: "blur(18px)",

        border: "1px solid rgba(255,255,255,.25)",

        boxShadow:
          "0 20px 60px rgba(15,23,42,.12)",
      }}
    >
      {children}
    </Paper>
  );
}