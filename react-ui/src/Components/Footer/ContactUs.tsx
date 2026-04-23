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
        Terms of Use
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
          Welcome to SimplyManage. By accessing or using our application, you
          agree to be bound by these Terms of Use. If you do not agree, please do
          not use the service.
        </Typography>

        <Typography variant="h6" gutterBottom>
          1. Use of Service
        </Typography>
        <Typography variant="body2" paragraph>
          This application is intended for managing library-related data and
          resources. You agree to use the service only for lawful purposes and in
          a way that does not infringe the rights of others or restrict their use
          of the service.
        </Typography>

        <Typography variant="h6" gutterBottom>
          2. User Responsibilities
        </Typography>
        <Typography variant="body2" paragraph>
          You are responsible for maintaining the confidentiality of your account
          and any activities that occur under it. You agree not to misuse the
          system, attempt unauthorized access, or disrupt the application.
        </Typography>

        <Typography variant="h6" gutterBottom>
          3. Intellectual Property
        </Typography>
        <Typography variant="body2" paragraph>
          All content, features, and functionality of this application are owned
          by SimplyManage and are protected by applicable laws. You may not copy,
          modify, or distribute any part of the service without permission.
        </Typography>

        <Typography variant="h6" gutterBottom>
          4. Limitation of Liability
        </Typography>
        <Typography variant="body2" paragraph>
          SimplyManage is provided "as is" without warranties of any kind. We are
          not responsible for any damages resulting from the use or inability to
          use the service.
        </Typography>

        <Typography variant="h6" gutterBottom>
          5. Changes to Terms
        </Typography>
        <Typography variant="body2" paragraph>
          We reserve the right to update these Terms of Use at any time. Continued
          use of the service after changes are made constitutes acceptance of the
          revised terms.
        </Typography>

        <Typography variant="h6" gutterBottom>
          6. Contact Information
        </Typography>
        <Typography variant="body2">
          If you have any questions about these Terms, please contact us at
          support@simplymanage.com.
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