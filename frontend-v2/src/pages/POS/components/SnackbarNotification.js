import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const SnackbarNotification = ({ open, onClose, message, severity = 'success' }) => (
  <Snackbar
    open={open}
    autoHideDuration={2000}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
  >
    <Alert
      onClose={onClose}
      sx={{ width: '100%' }}
      iconMapping={{ success: <CheckCircleIcon fontSize="inherit" /> }}
      severity={severity}
    >
      {message}
    </Alert>
  </Snackbar>
);

export default SnackbarNotification;






