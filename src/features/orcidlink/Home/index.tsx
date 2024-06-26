/**
 * This is the initial component of the "Home" component.
 *
 * Generally, the home component presents the appropriate view and options when
 * a user navigates to "KBASE ORCID Link".
 *
 * Generally, the orcidlink home component determines whether the user has a
 * link or not, and shows the appropriate component, HomeLinked or HomeUnlinked.
 *
 * This specific component exists to enforce the existence of the "username"
 * parameter extracted from the state, even though this component is invoked by
 * the Authed component, which ensures that the application state is authenticated.
 *
 * Another approach could be for Authed to pass auth state to the sub-component.
 */
import { Box } from '@mui/material';
import { useAppSelector } from '../../../common/hooks';
import { authUsername } from '../../auth/authSlice';
import ErrorMessage, { makeCommonError } from '../common/ErrorMessage';
import styles from '../common/styles.module.scss';
import HomeController from './controller';

export default function HomeEntrypoint() {
  const username = useAppSelector(authUsername);

  if (typeof username === 'undefined') {
    return (
      <Box className={styles.paper} sx={{ p: 4 }}>
        <ErrorMessage
          error={makeCommonError({
            message: 'Impossible - username is not defined',
          })}
        />
      </Box>
    );
  }

  return (
    <Box className={styles.paper} sx={{ p: 4 }}>
      <HomeController username={username} />
    </Box>
  );
}
