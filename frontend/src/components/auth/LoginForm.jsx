import { useState } from "react";

import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
} from "@mui/material";

import {
  Visibility,
  VisibilityOff,
  LoginRounded,
} from "@mui/icons-material";

import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

import { Formik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

import AuthCard from "./AuthCard";
import useAuth from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../api/axios";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const redirectTo = location.state?.from?.pathname || "/";

  return (
    <AuthCard>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h3" fontWeight={700}>
            Welcome Back
          </Typography>

          <Typography color="text.secondary" mt={1}>
            Sign in to continue to SkyReserve.
          </Typography>
        </Box>

        <Formik
          initialValues={{ email: "", password: "", remember: true }}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            try {
              setLoading(true);

              const user = await login({
                email: values.email,
                password: values.password,
              });

              toast.success("Login Successful");

              navigate(
                user?.role === "ADMIN" ? "/admin" : redirectTo,
                { replace: true }
              );
            } catch (error) {
              toast.error(getApiErrorMessage(error, "Login Failed"));
            } finally {
              setLoading(false);
            }
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleSubmit,
          }) => (
            <Stack spacing={3} component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
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

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.remember}
                      name="remember"
                      onChange={handleChange}
                    />
                  }
                  label="Remember Me"
                />
              </Stack>

              <Button
                disabled={loading}
                fullWidth
                size="large"
                variant="contained"
                startIcon={<LoginRounded />}
                type="submit"
                sx={{ height: 56, borderRadius: 3 }}
              >
                {loading ? "Signing In..." : "Login"}
              </Button>
            </Stack>
          )}
        </Formik>

        <Divider />

        <Typography textAlign="center">
          Don't have an account?{" "}
          <Link component={RouterLink} to="/register" underline="hover">
            Create Account
          </Link>
        </Typography>
      </Stack>
    </AuthCard>
  );
}
