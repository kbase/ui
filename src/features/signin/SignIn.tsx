import {
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { FC } from 'react';
import logoRectangle from '../../common/assets/logo/rectangle.png';
import classes from './SignIn.module.scss';

export const SignIn: FC = () => {
  return (
    <Container maxWidth="sm">
      <Stack spacing={2} textAlign="center">
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="center"
        >
          <img
            src={logoRectangle}
            alt="KBase circles logo"
            className={classes['logo']}
          />
        </Stack>
        <Typography fontStyle="italic">
          A collaborative, open environment for systems biology of plants,
          microbes and their communities.
        </Typography>
        <Paper
          sx={{
            padding: 2,
          }}
        >
          <Stack spacing={2}>
            <Stack spacing={1}>
              <Typography variant="h4" component="h1">
                Sign in
              </Typography>
              <Button variant="contained">Continue with ORCID</Button>
              <Button variant="contained">Continue with Google</Button>
              <Button variant="contained">Continue with Globus</Button>
            </Stack>
            <Box
              sx={{
                alignSelf: 'center',
                backgroundColor: 'grey.400',
                height: '1px',
                width: '80%',
              }}
            />
            <Typography textAlign="center">
              Need a KBase account? <Link>Sign up</Link>
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};
