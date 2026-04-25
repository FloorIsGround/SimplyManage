import { Box, Typography, Paper, useTheme } from "@mui/material";

function PrivacyPolicy() {
  const theme = useTheme();

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
      <Typography
        variant="h3"
        textAlign="center"
        gutterBottom
        color="primary"
      >
        Privacy Policy
      </Typography>

      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: 2,
          borderLeft: "6px solid",
          borderColor: "primary.main"
        }}
      >
        <Typography variant="body1" paragraph>
          SimplyManage respects your privacy. This Privacy Policy explains how we
          collect, use, and protect your information when you use our application.
        </Typography>

        <Typography variant="h6" gutterBottom>
          1. Information We Collect
        </Typography>
        <Typography variant="body2" paragraph>
          We may collect personal information such as your name, email address,
          and account details when you register or interact with the application.
          We may also collect non-personal data such as usage statistics to
          improve our services.
        </Typography>

        <Typography variant="h6" gutterBottom>
          2. How We Use Your Information
        </Typography>
        <Typography variant="body2" paragraph>
          Your information is used to operate and improve the application,
          provide support, and communicate important updates. We do not sell your
          personal information to third parties.
        </Typography>

        <Typography variant="h6" gutterBottom>
          3. Data Security
        </Typography>
        <Typography variant="body2" paragraph>
          We take reasonable measures to protect your data from unauthorized
          access, alteration, or disclosure. However, no method of transmission
          over the internet is completely secure.
        </Typography>

        <Typography variant="h6" gutterBottom>
          4. Sharing of Information
        </Typography>
        <Typography variant="body2" paragraph>
          We may share information only when necessary to comply with legal
          obligations or to protect the rights and safety of our users and
          application.
        </Typography>

        <Typography variant="h6" gutterBottom>
          5. Cookies and Tracking
        </Typography>
        <Typography variant="body2" paragraph>
          Our application may use cookies or similar technologies to enhance user
          experience and analyze usage patterns.
        </Typography>

        <Typography variant="h6" gutterBottom>
          6. Changes to This Policy
        </Typography>
        <Typography variant="body2" paragraph>
          We may update this Privacy Policy from time to time. Continued use of
          the application after changes are made indicates acceptance of the
          updated policy.
        </Typography>

        <Typography variant="h6" gutterBottom>
          7. Contact Information
        </Typography>
        <Typography variant="body2">
          If you have any questions about this Privacy Policy, please contact us
          at support@simplymanage.com.
        </Typography>
      </Paper>

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2" sx={{ color: theme.palette.secondary.main }}>
          Last updated: April 2026
        </Typography>
      </Box>
    </Box>
  );
}

export default PrivacyPolicy;