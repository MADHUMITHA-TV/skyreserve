import { useEffect, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  Avatar,
  Stack,
  Chip,
  CircularProgress,
} from "@mui/material";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import { getProfile, updateProfile } from "../../services/userService";
import useAuth from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../api/axios";

const validationSchema = Yup.object({
  firstName: Yup.string().trim().notRequired(),
  lastName: Yup.string().trim().notRequired(),
  phone: Yup.string()
    .transform((v) => (v === "" ? undefined : v))
    .min(10, "Invalid phone number")
    .max(15, "Invalid phone number")
    .notRequired(),
});

export default function Profile() {
  const { setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch((err) => toast.error(getApiErrorMessage(err, "Unable to load profile.")))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ pt: 18, minHeight: "100vh", display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <Box sx={{ pt: 12, pb: 8, background: "#F5F7FB", minHeight: "100vh" }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 5, borderRadius: 5 }}>
            <Stack alignItems="center" spacing={2} mb={4}>
              <Avatar sx={{ width: 84, height: 84, bgcolor: "primary.main", fontSize: 32 }}>
                {profile?.firstName?.[0]?.toUpperCase() || "U"}
              </Avatar>

              <Typography variant="h5" fontWeight={700}>
                {profile?.firstName} {profile?.lastName}
              </Typography>

              <Chip label={profile?.role} color="primary" size="small" />
            </Stack>

            <Formik
              enableReinitialize
              initialValues={{
                firstName: profile?.firstName || "",
                lastName: profile?.lastName || "",
                phone: profile?.phone || "",
              }}
              validationSchema={validationSchema}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  const payload = {
                    firstName: values.firstName || undefined,
                    lastName: values.lastName || undefined,
                    phone: values.phone || undefined,
                  };

                  const updated = await updateProfile(payload);
                  setProfile(updated);
                  setUser((prev) => ({ ...prev, ...updated }));
                  toast.success("Profile updated");
                } catch (err) {
                  toast.error(getApiErrorMessage(err, "Unable to update profile."));
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ values, errors, touched, handleChange, handleSubmit, isSubmitting }) => (
                <Stack spacing={3} component="form" onSubmit={handleSubmit}>
                  <TextField label="Email" value={profile?.email || ""} disabled fullWidth />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={values.firstName}
                        onChange={handleChange}
                        error={touched.firstName && Boolean(errors.firstName)}
                        helperText={touched.firstName && errors.firstName}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={values.lastName}
                        onChange={handleChange}
                        error={touched.lastName && Boolean(errors.lastName)}
                        helperText={touched.lastName && errors.lastName}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    error={touched.phone && Boolean(errors.phone)}
                    helperText={touched.phone && errors.phone}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    sx={{ height: 56, borderRadius: 3 }}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </Stack>
              )}
            </Formik>
          </Paper>
        </Container>
      </Box>

      <Footer />
    </>
  );
}
