import React from 'react';
import { Popover, Card, CardContent, CardActions, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export interface SettingsPopupProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({ open, anchorEl, onClose }) => {
  const navigate = useNavigate();

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{ paper: { sx: { borderRadius: 2 } } }}
    >
      <Card sx={{ minWidth: 220, maxWidth: 260, p: 1.5 }}>
        <CardContent sx={{ p: 0, pb: '10px !important' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontSize: 16, textAlign: 'center' }}>
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, textAlign: 'center' }}>
            Manage your account and settings.
          </Typography>
        </CardContent>
        <CardActions sx={{ flexDirection: 'column', gap: 0.5, pt: 0 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="medium"
            onClick={() => {
              onClose();
              navigate('/');
            }}
          >
            SimplyManage Homepage
          </Button>
          <Button
            variant="text"
            color="primary"
            fullWidth
            size="medium"
            onClick={onClose}
          >
            Close
          </Button>
        </CardActions>
      </Card>
    </Popover>
  );
};

export default SettingsPopup;
