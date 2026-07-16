import { useEffect, useState } from "react";
import { Paper, Grid, TextField, Button, Autocomplete } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getAirports } from "../../services/airportService";

export default function SearchFlightCard() {
  const navigate = useNavigate();
  const [airports, setAirports] = useState([]);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [date, setDate] = useState("");

  useEffect(() => {
    getAirports()
      .then((data) => setAirports(data || []))
      .catch(() => toast.error("Unable to load airports"));
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (from) params.set("departureAirportId", from.id);
    if (to) params.set("arrivalAirportId", to.id);
    if (date) params.set("date", date);
    navigate(`/flights?${params.toString()}`);
  };

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
          <Autocomplete
            options={airports}
            value={from}
            onChange={(e, value) => setFrom(value)}
            getOptionLabel={(option) =>
              option ? `${option.city} (${option.code})` : ""
            }
            isOptionEqualToValue={(o, v) => o.id === v.id}
            renderInput={(params) => <TextField {...params} label="From" />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Autocomplete
            options={airports}
            value={to}
            onChange={(e, value) => setTo(value)}
            getOptionLabel={(option) =>
              option ? `${option.city} (${option.code})` : ""
            }
            isOptionEqualToValue={(o, v) => o.id === v.id}
            renderInput={(params) => <TextField {...params} label="To" />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            type="date"
            label="Departure Date"
            InputLabelProps={{ shrink: true }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<SearchRoundedIcon />}
            sx={{ height: "100%" }}
            onClick={handleSearch}
          >
            Search
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
