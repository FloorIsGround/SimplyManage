import { useState } from "react";
import { Button, Card, CardActions, CardContent, Popover, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export interface LoginProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  apiEndpoint?: string;
  redirectPath?: string;
}

function Login({ open, anchorEl, onClose, apiEndpoint = "/users/login", redirectPath }: LoginProps) {
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleClose = () => {
    setLoginEmail("");
    setLoginPassword("");
    setLoginError(null);
    onClose();
  };

  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError(null);

    try {
      const { default: axios } = await import("../../utils/axios-api");

      const res = await axios.post(apiEndpoint, {
        email: loginEmail,
        password: loginPassword
      });

      localStorage.setItem("token", res.data.token);

      setLoginEmail("");
      setLoginPassword("");
      handleClose();
      if (redirectPath) {
        navigate(redirectPath);
      }
    } catch (err: any) {
      setLoginError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
            Log In to Your Account
          </Typography>
          <TextField
            id="email"
            label="Email"
            variant="outlined"
            fullWidth
            size="small"
            sx={{ mt: 1, mb: 0.5 }}
            value={loginEmail}
            onChange={e => setLoginEmail(e.target.value)}
            autoComplete="username"
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            size="small"
            sx={{ mb: 0 }}
            value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
            autoComplete="current-password"
          />
          {loginError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {loginError}
            </Typography>
          )}
        </CardContent>
        <CardActions sx={{ flexDirection: 'column', gap: 0.5, pt: 0 }}>
          <Button
            size="medium"
            variant="contained"
            fullWidth
            onClick={handleLogin}
            disabled={loginLoading || !loginEmail || !loginPassword}
          >
            {loginLoading ? "Logging In..." : "Log In"}
          </Button>
          <Button size="medium" variant="text" fullWidth onClick={() => { handleClose(); navigate("/sign-up") }}>
            Sign Up
          </Button>
        </CardActions>
      </Card>
    </Popover>
  );
}

export default Login;
