import { useEffect } from 'react';
import { Container, Stack, CircularProgress, Typography } from '@mui/material';
import { useLogout } from './LogIn';
import { usePageTitle } from '../layout/layoutSlice';

export const Logout = () => {
  const logout = useLogout();
  usePageTitle('Logging Out');

  useEffect(() => {
    // Automatically trigger logout when component mounts
    logout();
  }, [logout]);

  return (
    <Container maxWidth="sm">
      <Stack
        spacing={3}
        textAlign="center"
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: '60vh' }}
      >
        <CircularProgress size={60} />
        <Typography variant="h5">Logging out...</Typography>
      </Stack>
    </Container>
  );
};
