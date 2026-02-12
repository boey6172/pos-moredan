import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';

const CustomerNameDialog = ({ open, name, setName, onProceed, onCancel }) => {
  const [inputValue, setInputValue] = useState(name);

  useEffect(() => {
    setInputValue(name);
  }, [name, open]);

  useEffect(() => {
    if (name && open) {
      onProceed();
    }
  }, [name, open, onProceed]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter' && inputValue.trim()) {
        setName(inputValue.trim());
      }
    },
    [inputValue, setName]
  );

  const handleProceed = useCallback(() => {
    setName(inputValue.trim());
  }, [inputValue, setName]);

  return (
    <Dialog open={open} onClose={() => {}} maxWidth="xs" fullWidth>
      <DialogTitle>Enter Customer Name</DialogTitle>
      <DialogContent>
        <TextField
          label="Customer Name"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          fullWidth
          autoFocus
          onKeyDown={handleKeyPress}
          margin="normal"
          required
          aria-label="Customer name input"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={handleProceed} variant="contained" disabled={!inputValue.trim()}>
          Proceed
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerNameDialog;






