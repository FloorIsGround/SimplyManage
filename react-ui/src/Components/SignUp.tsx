import { useState, useEffect } from "react";
import {
  Box,
  FormGroup,
  FormControl,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Alert,
  TextField,
  useTheme,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Role, UserStatus } from "../Models/User/User";
import type { User } from "../Models/User/User";
import axios from "../utils/axios-api";
import { validateFields, signUpValidationRules } from "../utils/validation";

interface SignUpTextFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  sx?: object;
  slotProps?: object;
  fullWidth?: boolean;
}

const SignUpTextField: React.FC<SignUpTextFieldProps> = ({
  label,
  type = "text",
  value,
  onChange,
  sx,
  slotProps,
  fullWidth = true,
}) => (
  <TextField
    label={label}
    type={type}
    value={value}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
    fullWidth={fullWidth}
    sx={sx}
    slotProps={slotProps}
  />
);


function SignUp() {
  const theme = useTheme();
  const [form, setForm] = useState<User>({
    id: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    role: Role.patron,
    status: UserStatus.active,
    createdAt: new Date(),
    borrowedBooks: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    dateOfBirth: false,
  });

  const [dateError, setDateError] = useState<string | null>(null);
  const dateValue = form.dateOfBirth ? new Date(form.dateOfBirth) : null;

  const handleDateChange = (date: Date | null) => {
    if (!date) {
      setDateError("Date is required");
      setForm({ ...form, dateOfBirth: "" });
      return;
    }
    setDateError(null);
    setForm({ ...form, dateOfBirth: date.toISOString().split("T")[0] });
  };

  // Reset form state and touched state
  const resetForm = () => {
    setForm({
      id: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      role: Role.patron,
      status: UserStatus.active,
      createdAt: new Date(),
      borrowedBooks: [],
    });
    setTouched({
      firstName: false,
      lastName: false,
      email: false,
      password: false,
      dateOfBirth: false,
    });
  };

  // Show success feedback for 3 seconds -- may change after redirect to profile
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleEmailSignUp = async () => {
    const validationError = validateFields(form, signUpValidationRules);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);
    setSuccess(false);
    try {
      await axios.post("/signup", form);
      setSuccess(true);
      setError(null);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Signup failed.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

    return (
      <Box
        sx={{
          maxWidth: 400,
          mx: "auto",
          mt: 6,
          p: 3,
          boxShadow: 2,
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        <FormGroup>
        <Typography
          variant="h4"
          textAlign="center"
          color="primary"
          gutterBottom
          sx={{ fontFamily: theme.typography.fontFamily }}
        >
          Sign Up
        </Typography>
        <Divider sx={{ mb: 3 }} />
          <FormControl sx={{ mb: 2, border: touched.firstName && !form.firstName ? '1px solid red' : undefined, borderRadius: 1 }}>
            <SignUpTextField
              label="First Name"
              value={form.firstName}
              onChange={val => setForm({ ...form, firstName: val })}
              fullWidth
              sx={{ borderColor: touched.firstName && !form.firstName ? 'red' : undefined }}
              slotProps={{
                input: {
                  onBlur: () => setTouched(t => ({ ...t, firstName: true })),
                  onFocus: () => setTouched(t => ({ ...t, firstName: false }))
                }
              }}
            />
          </FormControl>
          <FormControl sx={{ mb: 2, border: touched.lastName && !form.lastName ? '1px solid red' : undefined, borderRadius: 1 }}>
            <SignUpTextField
              label="Last Name"
              value={form.lastName}
              onChange={val => setForm({ ...form, lastName: val })}
              fullWidth
              sx={{ borderColor: touched.lastName && !form.lastName ? 'red' : undefined }}
              slotProps={{
                input: {
                  onBlur: () => setTouched(t => ({ ...t, lastName: true })),
                  onFocus: () => setTouched(t => ({ ...t, lastName: false }))
                }
              }}
            />
          </FormControl>
          <FormControl sx={{ mb: 2, border: touched.dateOfBirth && dateError ? '1px solid red' : undefined, borderRadius: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="DD/MM/YYYY"
                value={dateValue}
                onChange={handleDateChange}
                maxDate={new Date('2100-12-31')}
                minDate={new Date('1900-01-01')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: { fontFamily: theme.typography.fontFamily },
                    onBlur: () => setTouched(t => ({ ...t, dateOfBirth: true })),
                    onFocus: () => setTouched(t => ({ ...t, dateOfBirth: false }))
                  }
                }}
              />
            </LocalizationProvider>
          </FormControl>
          <FormControl sx={{ mb: 2, border: touched.email && (!form.email || (error && error.toLowerCase().includes('invalid'))) ? '1px solid red' : undefined, borderRadius: 1 }}>
            <SignUpTextField
              label="Email"
              type="email"
              value={form.email}
              onChange={val => setForm({ ...form, email: val })}
              fullWidth
              sx={{ borderColor: touched.email && (!form.email || (error && error.toLowerCase().includes('invalid'))) ? 'red' : undefined }}
              slotProps={{
                input: {
                  onBlur: () => setTouched(t => ({ ...t, email: true })),
                  onFocus: () => setTouched(t => ({ ...t, email: false }))
                }
              }}
            />
          </FormControl>
          <FormControl sx={{ mb: 2, border: touched.password && !form.password ? '1px solid red' : undefined, borderRadius: 1 }}>
            <SignUpTextField
              label="Password"
              type="password"
              value={form.password}
              onChange={val => setForm({ ...form, password: val })}
              fullWidth
              sx={{ borderColor: touched.password && !form.password ? 'red' : undefined }}
              slotProps={{
                input: {
                  onBlur: () => setTouched(t => ({ ...t, password: true })),
                  onFocus: () => setTouched(t => ({ ...t, password: false }))
                }
              }}
            />
          </FormControl>
        </FormGroup>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleEmailSignUp}
          sx={{ fontFamily: theme.typography.fontFamily }}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </Button>
        {success && (
          <Alert severity="success" sx={{ mt: 2, fontFamily: theme.typography.fontFamily }}>
            Sign up successful!
          </Alert>
        )}
      </Box>
    );
}

export default SignUp;
