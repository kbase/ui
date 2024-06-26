/**
 * Entrypoint for the CreateLink component.
 *
 * It's sole responsibility is to ensure that props required by the controller
 * are actually present. It is basically a "filter component", whose purpose is
 * to ensure that the child component's prop constraints are met in a case where
 * the props come from external, unreliable or are otherwise typed incompatibly.
 * In the case of a constraint violation, an error message is displayed.
 *
 * Note that in this case these constraint violations should never occcur. The
 * uncertainty about props is due to the fact that they are derived from app
 * state. App state is global, yet this component is only rendered if
 * the parent component "Authed" is satisfied. So we "know" that the app is
 * authenticated, and that the auth subset of the app state is fully populated.
 *
 * The problem is that global state and component flow are incompatible,
 * incongruent.
 *
 * If one wants to avoid such a filter component, one solution could be to have
 * the Authed component pass auth state to it's children.
 *
 */
import { Box } from '@mui/material';
import { useAppSelector } from '../../../common/hooks';
import { authUsername } from '../../auth/authSlice';
import ErrorMessage, { makeCommonError } from '../common/ErrorMessage';
import styles from '../common/styles.module.scss';
import Controller from './controller';

export default function CreateLinkPrecondition() {
  const username = useAppSelector(authUsername);
  const token = useAppSelector((state) => state.auth.token);

  if (!username) {
    // return <div>NO USERNAME</div>;
    return (
      <Box className={styles.paper} sx={{ p: 4 }}>
        <ErrorMessage
          error={makeCommonError({
            message: 'Impossible - username is not present',
          })}
        />
      </Box>
    );
  }

  if (!token) {
    return (
      <Box className={styles.paper} sx={{ p: 4 }}>
        <ErrorMessage
          error={makeCommonError({
            message: 'Impossible - no token present',
          })}
        />
      </Box>
    );
  }

  return (
    <Box className={styles.paper} sx={{ p: 4 }}>
      <Controller username={username} token={token} />
    </Box>
  );
}
