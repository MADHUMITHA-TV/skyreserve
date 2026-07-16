import { useEffect, useState } from "react";
import {
  Paper,
  Grid,
  TextField,
  Button,
  Stack,
  Autocomplete,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import { getAirports } from "../../services/airportService";

export default function FlightSearchForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [airports, setAirports] = useState([]);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [date, setDate] = useState(searchParams.get("date") || "");

  useEffect(() => {
    getAirports()
      .then((data) => setAirports(data || []))
      .catch(() => toast.error("Unable to load airports"));
  }, []);

  // Once airports are loaded, hydrate the selects from the current URL
  // (so refreshing /flights?departureAirportId=... keeps the fields in sync).
  useEffect(() => {
    if (!airports.length) return;

    const depId = searchParams.get("departureAirportId");
    const arrId = searchParams.get("arrivalAirportId");

    if (depId) setFrom(airports.find((a) => a.id === depId) || null);
    if (arrId) setTo(airports.find((a) => a.id === arrId) || null);
  }, [airports, searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (from) params.set("departureAirportId", from.id);
    if (to) params.set("arrivalAirportId", to.id);
    if (date) params.set("date", date);

    navigate(`/flights?${params.toString()}`);
  };

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
        <Grid size={{ xs: 12, md: 4 }}>
          <Autocomplete
            options={airports}
            value={from}
            onChange={(e, value) => setFrom(value)}
            getOptionLabel={(option) =>
              option ? `${option.city} (${option.code})` : ""
            }
            isOptionEqualToValue={(o, v) => o.id === v.id}
            renderInput={(params) => (
              <TextField {...params} label="From" placeholder="Departure city" />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Autocomplete
            options={airports}
            value={to}
            onChange={(e, value) => setTo(value)}
            getOptionLabel={(option) =>
              option ? `${option.city} (${option.code})` : ""
            }
            isOptionEqualToValue={(o, v) => o.id === v.id}
            renderInput={(params) => (
              <TextField {...params} label="To" placeholder="Arrival city" />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <TextField
            fullWidth
            type="date"
            label="Departure Date"
            InputLabelProps={{ shrink: true }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Stack justifyContent="center" sx={{ height: "100%" }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SearchRoundedIcon />}
              sx={{ height: 56 }}
              onClick={handleSearch}
            >
              Search
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
