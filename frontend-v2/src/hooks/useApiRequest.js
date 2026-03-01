import { useState, useCallback } from 'react';

/**
 * Custom hook to prevent double-clicking on API request buttons
 * @returns {Object} { isLoading, execute }
 */
const useApiRequest = () => {
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async (asyncFunction) => {
    if (isLoading) return; // Prevent execution if already loading
    
    setIsLoading(true);
    try {
      await asyncFunction();
    } catch (error) {
      throw error; // Re-throw to let caller handle
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return { isLoading, execute };
};

export default useApiRequest;
