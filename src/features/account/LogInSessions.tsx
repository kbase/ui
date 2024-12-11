import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
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

/**
 * Dummy data for the log in sessions table.
 * Can be deleted once table is linked to backend.
 */
const sampleSessions = [
  {
    created: 'Jul 9, 2024 at 9:05am	',
    expires: '10d 18h 42m	',
    browser: 'Chrome 125.0.0.0	',
    operatingSystem: 'Mac OS X 10.15.7	',
    ipAddress: '192.184.174.53',
  },
];

/**
 * Content for the Log In Sessions tab in the Account page
 */
export const LogInSessions: FC = () => {
  const currentSessions = sampleSessions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const otherSessions: any[] = [];

  return (
    <Stack
      spacing={4}
      role="tabpanel"
      id="sessions-tabpanel"
      aria-labelledby="sessions-tab"
    >
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h2">My Current Log In Sessions</Typography>
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
          {currentSessions.map((session, i) => (
            <TableRow key={`${session}-${i}`}>
              <TableCell>{session.created}</TableCell>
              <TableCell>{session.expires}</TableCell>
              <TableCell>{session.browser}</TableCell>
              <TableCell>{session.operatingSystem}</TableCell>
              <TableCell>{session.ipAddress}</TableCell>
              <TableCell>
                <Button variant="contained" color="error">
                  Log out
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Typography variant="h2">Other Log In Sessions</Typography>
      {otherSessions && otherSessions.length > 0 && (
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
            {otherSessions.map((session, i) => (
              <TableRow key={`${session}-${i}`}>
                <TableCell>{session.created}</TableCell>
                <TableCell>{session.expires}</TableCell>
                <TableCell>{session.browser}</TableCell>
                <TableCell>{session.operatingSystem}</TableCell>
                <TableCell>{session.ipAddress}</TableCell>
                <TableCell>
                  <Button variant="contained" color="error">
                    Log out
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {(!otherSessions || otherSessions.length === 0) && (
        <i>No additional active log in sessions.</i>
      )}
    </Stack>
  );
};
