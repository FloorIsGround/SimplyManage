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
import { useSignUpForm } from "./SignUpForm";

function SignUp() {
    type FieldName = "firstName" | "lastName" | "email" | "password";
    const renderField = (field: FieldName, label: string, type: string = "text", errorCondition: boolean = false) => (
      <FormControl sx={{ mb: 2, border: touched[field] && errorCondition ? '1px solid red' : undefined, borderRadius: 1 }}>
        <TextField
          label={label}
          type={type}
          value={form[field] as string}
          onChange={e => setForm({ ...form, [field]: e.target.value })}
          fullWidth
          sx={{ borderColor: touched[field] && errorCondition ? 'red' : undefined }}
          slotProps={{
            input: {
              onBlur: () => handleTouch(field, true),
              onFocus: () => handleTouch(field, false)
            }
          }}
        />
      </FormControl>
    );
  const theme = useTheme();
  const {
    form,
    setForm,
    touched,
    handleTouch,
    dateValue,
    handleDateChange,
    error,
    loading,
    success,
    handleSubmit,
  } = useSignUpForm();

    return (
      <Box
        sx={{
          maxWidth: 400,
          mx: "auto",
          p: 3,
          boxShadow: 2,
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        <FormGroup>
        <Typography variant="h4" textAlign="center" color="primary" gutterBottom>
          Sign Up
        </Typography>
        <Divider sx={{ mb: 3 }} />
          {renderField('firstName', 'First Name', 'text', !form.firstName)}
          {renderField('lastName', 'Last Name', 'text', !form.lastName)}
          <Box sx={{ mb: 2 }}>
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
                    onBlur: () => handleTouch('dateOfBirth', true),
                    onFocus: () => handleTouch('dateOfBirth', false)
                  }
                }}
              />
            </LocalizationProvider>
          </Box>
            {renderField('email', 'Email', 'email', !form.email || !!(error && error.toLowerCase().includes('invalid')))}
          {renderField('password', 'Password', 'password', !form.password)}
        </FormGroup>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </Button>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Sign up successful!
          </Alert>
        )}
      </Box>
    );
}

export default SignUp;
