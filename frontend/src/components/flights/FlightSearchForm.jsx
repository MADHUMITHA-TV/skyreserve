import {
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  Stack,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

const cabinClasses = [
  "Economy",
  "Premium Economy",
  "Business",
  "First Class",
];

export default function FlightSearchForm() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        mb: 5,
        borderRadius: 5,
        background: "#fff",
        boxShadow: "0 15px 40px rgba(0,0,0,.06)",
      }}
    >
      <Grid container spacing={3}>

        <Grid size={{ xs: 12, md: 2 }}>
          <TextField
            fullWidth
            label="From"
            placeholder="Chennai"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <TextField
            fullWidth
            label="To"
            placeholder="Bangalore"
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
            inputProps={{
              min: 1,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <TextField
            select
            fullWidth
            label="Cabin"
            defaultValue="Economy"
          >
            {cabinClasses.map((item) => (
              <MenuItem
                key={item}
                value={item}
              >
                {item}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Stack
            justifyContent="center"
            sx={{
              height: "100%",
            }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<SearchRoundedIcon />}
              sx={{
                height: 56,
              }}
            >
              Search
            </Button>
          </Stack>
        </Grid>

      </Grid>
    </Paper>
  );
}