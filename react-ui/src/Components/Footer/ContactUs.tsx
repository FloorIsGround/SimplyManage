import { Box, Typography, Paper, TextField, Button, useTheme } from "@mui/material";
import { useState } from "react";

function ContactUs() {
  const theme = useTheme();

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submitted:", form);

    setForm({
      name: "",
      email: "",
      message: ""
    });
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 4 }}>
      <Typography
        variant="h3"
        textAlign="center"
        gutterBottom
        color="primary"
      >
        Contact Us
      </Typography>

      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: 2,
          borderLeft: "6px solid",
          borderColor: "primary.main"
        }}
      >
        <Typography variant="body1" sx={{ mb: 2 }}>
          Need assistance? Send us a message and our team will respond shortly.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Message"
            name="message"
            multiline
            rows={4}
            value={form.message}
            onChange={handleChange}
            margin="normal"
            required
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
          >
            Send Message
          </Button>
        </Box>
      </Paper>

      {/* Contact Info */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h6" sx={{ color: theme.palette.secondary.main }}>
          Library Contact Info
        </Typography>
        <Typography variant="body2">Email: support@simplymanage.com</Typography>
        <Typography variant="body2">Phone: (123) 456-7890</Typography>
      </Box>
    </Box>
  );
}

export default ContactUs;