import { Container, Stack } from '@mui/system';
import { useEffect } from 'react';
import { Loader } from '../../common/components';

export const CDMRedirect = () => {
  useEffect(() => {
    window.location.href = `https://cdmhub.${process.env.REACT_APP_KBASE_DOMAIN}/hub`;
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
