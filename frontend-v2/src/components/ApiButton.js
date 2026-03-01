import React from 'react';
import { Button, CircularProgress } from '@mui/material';

/**
 * Button component that prevents double-clicking during API requests
 * Automatically disables and shows loading state during async operations
 */
const ApiButton = ({ 
  onClick, 
  children, 
  loading: externalLoading, 
  disabled: externalDisabled,
  ...props 
}) => {
  const [internalLoading, setInternalLoading] = React.useState(false);
  
  const loading = externalLoading !== undefined ? externalLoading : internalLoading;
  const disabled = loading || externalDisabled;

  const handleClick = async (e) => {
    if (loading || disabled) return;
    
    if (onClick) {
      // If onClick returns a promise, handle loading state
      const result = onClick(e);
      if (result && typeof result.then === 'function') {
        setInternalLoading(true);
        try {
          await result;
        } catch (error) {
          // Let the error propagate
          throw error;
        } finally {
          setInternalLoading(false);
        }
      }
    }
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      disabled={disabled}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : props.startIcon}
    >
      {children}
    </Button>
  );
};

export default ApiButton;
