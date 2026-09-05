import { useState, useCallback } from 'react';

export const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);
  
  const withLoading = useCallback(async (asyncFunction) => {
    setLoading(true);
    try {
      const result = await asyncFunction();
      return result;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return [loading, withLoading];
};

// Usage in components
const [loading, withLoading] = useLoading();

const handleSubmit = withLoading(async (data) => {
  await apiCall('/api/endpoint', { method: 'POST', body: JSON.stringify(data) });
});