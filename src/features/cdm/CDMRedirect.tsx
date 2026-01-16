import { Container, Stack } from '@mui/system';
import { useEffect } from 'react';
import { Loader } from '../../common/components';

export const CDMRedirect = () => {
  useEffect(() => {
    window.location.href = `https://${
      import.meta.env.VITE_KBASE_CDM_DOMAIN
    }/hub`;
  });
  return (
    <Container maxWidth="lg">
      <Stack
        direction={'row'}
        spacing={2}
        alignItems={'center'}
        paddingTop={'33%'}
        justifyContent={'center'}
      >
        <Loader />
        <div>Redirecting to CDM</div>
      </Stack>
    </Container>
  );
};
