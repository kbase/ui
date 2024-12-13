import { faCheck, faInfoCircle, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { FC } from 'react';
import { getTokens, revokeToken } from '../../common/api/authService';
import { Loader } from '../../common/components';
import { useAppSelector } from '../../common/hooks';
import { useLogout } from '../login/LogIn';

/**
 * Content for the Log In Sessions tab in the Account page
 */
export const LogInSessions: FC = () => {
  const token = useAppSelector(({ auth }) => auth.token ?? '');
  const tokenSessions = getTokens.useQuery(token, { skip: !token });

  const currentToken = tokenSessions.data?.current;
  const otherTokens = tokenSessions.data?.tokens;

  return (
    <Stack
      spacing={4}
      role="tabpanel"
      id="sessions-tabpanel"
      aria-labelledby="sessions-tab"
    >
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h2">Current Log In Session</Typography>
        <Tooltip
          title={
            <Stack spacing={1}>
              <Typography variant="body2">
                A log in session is created when you log in to KBase. A log in
                session is removed when you logout. However, if you do not
                logout, your log in session will remain active for two weeks. At
                the end of two weeks, the log in session will become invalid,
                and you will need to log in again.
              </Typography>
            </Stack>
          }
        >
          <Button startIcon={<FontAwesomeIcon icon={faInfoCircle} />}>
            About this tab
          </Button>
        </Tooltip>
      </Stack>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Created</TableCell>
            <TableCell>Expires</TableCell>
            <TableCell>Browser</TableCell>
            <TableCell>Operating System</TableCell>
            <TableCell>IP Address</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>
              {new Date(currentToken?.created ?? 0).toLocaleString()}
            </TableCell>
            <TableCell>
              {new Date(currentToken?.expires ?? 0).toLocaleString()}
            </TableCell>
            <TableCell>
              {currentToken?.agent} {currentToken?.agentver}
            </TableCell>
            <TableCell>
              {currentToken?.os} {currentToken?.osver}
            </TableCell>
            <TableCell>{currentToken?.ip}</TableCell>
            <TableCell>
              <LogOutButton tokenId={currentToken?.id} />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Typography variant="h2">Other Log In Sessions</Typography>
      {otherTokens && otherTokens.length > 0 && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Created</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell>Browser</TableCell>
              <TableCell>Operating System</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {otherTokens.map((otherToken, i) => (
              <TableRow key={`${otherToken.id}-${i}`}>
                <TableCell>
                  {new Date(otherToken.created ?? 0).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(otherToken.expires ?? 0).toLocaleString()}
                </TableCell>
                <TableCell>
                  {otherToken.agent} {otherToken.agentver}
                </TableCell>
                <TableCell>
                  {otherToken.os} {otherToken.osver}
                </TableCell>
                <TableCell>{otherToken.ip}</TableCell>
                <TableCell>
                  <LogOutButton tokenId={otherToken.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {(!otherTokens || otherTokens.length === 0) && (
        <i>No additional active log in sessions.</i>
      )}
    </Stack>
  );
};

const LogOutButton = ({ tokenId }: { tokenId?: string }) => {
  const logout = useLogout();
  const currentTokenId = useAppSelector(({ auth }) => auth.tokenInfo?.id);
  const [tirggerRevoke, revoke] = revokeToken.useMutation();
  return (
    <Button
      variant="contained"
      color="error"
      onClick={() => {
        if (currentTokenId === tokenId) {
          logout();
        } else if (tokenId) {
          tirggerRevoke(tokenId);
        }
      }}
      endIcon={
        revoke.isLoading ? (
          <Loader loading={true} type="spinner" />
        ) : revoke.isSuccess ? (
          <FontAwesomeIcon icon={faCheck} />
        ) : revoke.isError ? (
          <FontAwesomeIcon icon={faX} />
        ) : undefined
      }
    >
      Log out
    </Button>
  );
};
