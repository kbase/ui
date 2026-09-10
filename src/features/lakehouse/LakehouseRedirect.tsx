import { Container, Stack } from '@mui/system';
import { useEffect } from 'react';
import { Loader } from '../../common/components';

export const LakehouseRedirect = () => {
  useEffect(() => {
    window.location.href = `https://${process.env.REACT_APP_KBASE_LAKEHOUSE_DOMAIN}/hub`;
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
        <div>Redirecting to Lakehouse</div>
      </Stack>
    </Container>
  );
};
