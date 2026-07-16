import { useState } from "react";
import {
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Divider,
  Link,
} from "@mui/material";

import {
  Visibility,
  VisibilityOff,
  FlightTakeoffRounded,
} from "@mui/icons-material";

import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../api/axios";

const validationSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must contain minimum 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
});

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 500,
        p: 5,
        borderRadius: 5,
        backdropFilter: "blur(20px)",
        background: "rgba(255,255,255,.85)",
        border: "1px solid rgba(255,255,255,.4)",
        boxShadow: "0 20px 60px rgba(0,0,0,.08)",
      }}
    >
      <Stack spacing={3}>
        <Stack spacing={1} alignItems="center">
          <FlightTakeoffRounded color="primary" sx={{ fontSize: 48 }} />

          <Typography variant="h4" fontWeight={700}>
            Create Account
          </Typography>

          <Typography color="text.secondary" align="center">
            Join SkyReserve and start booking flights effortlessly.
          </Typography>
        </Stack>

        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await register({
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                password: values.password,
              });

              toast.success("Account created. Please sign in.");
              navigate("/login");
            } catch (error) {
              toast.error(getApiErrorMessage(error, "Registration Failed"));
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleSubmit,
            isSubmitting,
          }) => (
            <Stack spacing={3} component="form" onSubmit={handleSubmit}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={values.firstName}
                  onChange={handleChange}
                  error={touched.firstName && Boolean(errors.firstName)}
                  helperText={touched.firstName && errors.firstName}
                />

                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={values.lastName}
                  onChange={handleChange}
                  error={touched.lastName && Boolean(errors.lastName)}
                  helperText={touched.lastName && errors.lastName}
                />
              </Stack>

              <TextField
                fullWidth
                label="Email"
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={values.password}
                onChange={handleChange}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={values.confirmPassword}
                onChange={handleChange}
                error={
                  touched.confirmPassword && Boolean(errors.confirmPassword)
                }
                helperText={touched.confirmPassword && errors.confirmPassword}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                variant="contained"
                size="large"
                sx={{ height: 56, borderRadius: 3, fontSize: 16 }}
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
            </Stack>
          )}
        </Formik>

        <Divider />

        <Typography align="center">
          Already have an account?{" "}
          <Link component={RouterLink} to="/login" underline="hover">
            Login
          </Link>
        </Typography>
      </Stack>
    </Paper>
  );
}
