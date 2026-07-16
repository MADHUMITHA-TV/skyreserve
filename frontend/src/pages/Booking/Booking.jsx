import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

import { Formik, FieldArray } from "formik";
import * as Yup from "yup";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import { getFlightById } from "../../services/flightService";
import { createBooking } from "../../services/bookingService";
import { getApiErrorMessage } from "../../api/axios";
import { FARE_PER_PASSENGER } from "../../utils/constants";
import { formatCurrency, formatDateTime } from "../../utils/format";

const emptyPassenger = { firstName: "", lastName: "", age: "", gender: "" };

const validationSchema = Yup.object({
  passengers: Yup.array()
    .of(
      Yup.object({
        firstName: Yup.string()
          .trim()
          .max(100)
          .required("First name is required"),
        lastName: Yup.string()
          .trim()
          .max(100)
          .required("Last name is required"),
        age: Yup.number()
          .transform((v, orig) => (orig === "" ? undefined : v))
          .min(0)
          .max(120)
          .nullable(),
        gender: Yup.string()
          .oneOf(["MALE", "FEMALE", "OTHER", ""])
          .nullable(),
      })
    )
    .min(1, "At least one passenger is required")
    .max(9, "Maximum 9 passengers allowed"),
});

export default function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const flightId = searchParams.get("flightId");
  const seatId = searchParams.get("seatId");

  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!flightId || !seatId) {
      setError("Missing flight or seat selection. Please start over.");
      setLoading(false);
      return;
    }

    getFlightById(flightId)
      .then(setFlight)
      .catch((err) =>
        setError(getApiErrorMessage(err, "Unable to load flight details."))
      )
      .finally(() => setLoading(false));
  }, [flightId, seatId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <Box
          sx={{
            pt: 18,
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
        <Footer />
      </>
    );
  }

  if (error || !flight) {
    return (
      <>
        <Navbar />
        <Box sx={{ pt: 18, minHeight: "100vh" }}>
          <Container>
            <Alert severity="error">{error || "Flight not found."}</Alert>
            <Button sx={{ mt: 3 }} onClick={() => navigate("/flights")}>
              Back to Flights
            </Button>
          </Container>
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <Box sx={{ pt: 12, pb: 8, background: "#F5F7FB", minHeight: "100vh" }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} mb={1}>
            Passenger Details
          </Typography>

          <Typography color="text.secondary" mb={4}>
            {flight.airline?.name} · {flight.flightNumber} ·{" "}
            {formatDateTime(flight.departureTime)}
          </Typography>

          <Formik
            initialValues={{ passengers: [emptyPassenger] }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
              try {
                setSubmitting(true);

                const passengers = values.passengers.map((p) => ({
                  firstName: p.firstName.trim(),
                  lastName: p.lastName.trim(),
                  ...(p.age !== "" ? { age: Number(p.age) } : {}),
                  ...(p.gender ? { gender: p.gender } : {}),
                }));

                const booking = await createBooking({
                  flightId,
                  seatId,
                  passengers,
                });

                toast.success("Booking created. Proceed to payment.");
                navigate(`/payment/${booking.id}`);
              } catch (err) {
                toast.error(
                  getApiErrorMessage(err, "Unable to create booking.")
                );
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ values, errors, touched, handleChange, handleSubmit }) => (
              <Grid container spacing={4} component="form" onSubmit={handleSubmit}>
                <Grid size={{ xs: 12, lg: 8 }}>
                  <FieldArray name="passengers">
                    {({ push, remove }) => (
                      <Stack spacing={3}>
                        {values.passengers.map((passenger, index) => (
                          <Paper key={index} sx={{ p: 4, borderRadius: 4 }}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              mb={2}
                            >
                              <Stack direction="row" spacing={1} alignItems="center">
                                <PersonRoundedIcon color="primary" />
                                <Typography variant="h6" fontWeight={700}>
                                  Passenger {index + 1}
                                </Typography>
                              </Stack>

                              {values.passengers.length > 1 && (
                                <IconButton
                                  color="error"
                                  onClick={() => remove(index)}
                                >
                                  <DeleteRoundedIcon />
                                </IconButton>
                              )}
                            </Stack>

                            <Grid container spacing={2}>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                  fullWidth
                                  label="First Name"
                                  name={`passengers.${index}.firstName`}
                                  value={passenger.firstName}
                                  onChange={handleChange}
                                  error={Boolean(
                                    touched.passengers?.[index]?.firstName &&
                                      errors.passengers?.[index]?.firstName
                                  )}
                                  helperText={
                                    touched.passengers?.[index]?.firstName &&
                                    errors.passengers?.[index]?.firstName
                                  }
                                />
                              </Grid>

                              <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                  fullWidth
                                  label="Last Name"
                                  name={`passengers.${index}.lastName`}
                                  value={passenger.lastName}
                                  onChange={handleChange}
                                  error={Boolean(
                                    touched.passengers?.[index]?.lastName &&
                                      errors.passengers?.[index]?.lastName
                                  )}
                                  helperText={
                                    touched.passengers?.[index]?.lastName &&
                                    errors.passengers?.[index]?.lastName
                                  }
                                />
                              </Grid>

                              <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                  fullWidth
                                  type="number"
                                  label="Age (optional)"
                                  name={`passengers.${index}.age`}
                                  value={passenger.age}
                                  onChange={handleChange}
                                  inputProps={{ min: 0, max: 120 }}
                                />
                              </Grid>

                              <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                  select
                                  fullWidth
                                  label="Gender (optional)"
                                  name={`passengers.${index}.gender`}
                                  value={passenger.gender}
                                  onChange={handleChange}
                                >
                                  <MenuItem value="">Prefer not to say</MenuItem>
                                  <MenuItem value="MALE">Male</MenuItem>
                                  <MenuItem value="FEMALE">Female</MenuItem>
                                  <MenuItem value="OTHER">Other</MenuItem>
                                </TextField>
                              </Grid>
                            </Grid>
                          </Paper>
                        ))}

                        {typeof errors.passengers === "string" && (
                          <Alert severity="error">{errors.passengers}</Alert>
                        )}

                        {values.passengers.length < 9 && (
                          <Button
                            startIcon={<AddRoundedIcon />}
                            onClick={() => push({ ...emptyPassenger })}
                            sx={{ alignSelf: "flex-start" }}
                          >
                            Add Another Passenger
                          </Button>
                        )}
                      </Stack>
                    )}
                  </FieldArray>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                  <Paper sx={{ p: 4, borderRadius: 4, position: "sticky", top: 110 }}>
                    <Typography variant="h6" fontWeight={700} mb={2}>
                      Fare Summary
                    </Typography>

                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography color="text.secondary">
                          Fare per passenger
                        </Typography>
                        <Typography>
                          {formatCurrency(FARE_PER_PASSENGER)}
                        </Typography>
                      </Stack>

                      <Stack direction="row" justifyContent="space-between">
                        <Typography color="text.secondary">
                          Passengers
                        </Typography>
                        <Typography>{values.passengers.length}</Typography>
                      </Stack>

                      <Divider />

                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="h6" fontWeight={700}>
                          Total
                        </Typography>
                        <Typography variant="h6" color="primary" fontWeight={700}>
                          {formatCurrency(
                            FARE_PER_PASSENGER * values.passengers.length
                          )}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Alert severity="info" sx={{ mt: 3 }}>
                      One seat will be reserved for this booking; extra
                      passengers travel as companions on the same record.
                    </Alert>

                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting}
                      sx={{ mt: 3, height: 56 }}
                    >
                      {submitting ? "Creating Booking..." : "Confirm & Continue"}
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Formik>
        </Container>
      </Box>

      <Footer />
    </>
  );
}
