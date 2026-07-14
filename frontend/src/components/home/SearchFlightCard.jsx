import {
  Paper,
  Grid,
  TextField,
  Button,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

export default function SearchFlightCard() {
  return (
    <Paper
      elevation={12}
      sx={{
        mt: 5,
        p: 4,
        borderRadius: 5,
        backdropFilter: "blur(15px)",
        background: "rgba(255,255,255,.92)",
      }}
    >
      <Grid container spacing={3}>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="From"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="To"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <TextField
            fullWidth
            type="date"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <TextField
            fullWidth
            type="number"
            label="Passengers"
            defaultValue={1}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<SearchRoundedIcon />}
            sx={{
              height: "100%",
            }}
          >
            Search
          </Button>
        </Grid>

      </Grid>
    </Paper>
  );
}