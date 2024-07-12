import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Paper,
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
import globusLogo from '../../common/assets/globus.png';
import googleLogo from '../../common/assets/google.webp';
import orcidLogo from '../../common/assets/orcid.png';
import classes from './Account.module.scss';

/**
 * Dummy data for the linked providers table.
 * Can be deleted once table is linked to backend.
 */
const sampleProviders = [
  {
    provider: 'Google',
    username: 'coolkbasehuman@lbl.gov',
    linked: true,
  },
];

/**
 * Content for the Linked Providers tab in the Account page
 */
export const LinkedProviders: FC = () => {
  const linkedProviders = sampleProviders;
  return (
    <Stack spacing={4}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h2">Currently Linked Providers</Typography>
        <Tooltip
          title={
            <Stack spacing={1}>
              <Typography variant="body2">
                This tab provides access to all of the the external accounts
                which you have set up sign in to your KBase account. You should
                be able to recognize the account from the "Provider" and
                "Username" columns.
              </Typography>
              <Typography variant="body2">
                You may only link an external sign-in account to a single KBase
                account. If you attempt to link an external sign-in account
                which is already linked to another KBase account you will
                receive an error message.
              </Typography>
              <Typography variant="body2">
                You may unlink any linked sign-in account from your KBase
                Account at any time.
              </Typography>
              <Typography variant="body2">
                However, since you at present have just a single linked account,
                you will not be able to unlink it. A KBase account must always
                have at least one linked identity to ensure that it is
                accessible. If you wish to unlink this account, you must first
                link at least one additional sign-in account.
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
            <TableCell>Provider</TableCell>
            <TableCell>Username</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {linkedProviders.map((provider, i) => (
            <TableRow key={`${provider}-${i}`}>
              <TableCell>{provider.provider}</TableCell>
              <TableCell>{provider.username}</TableCell>
              <TableCell>
                <Button variant="contained" color="error">
                  Unlink
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Typography variant="h2">
        Link an additional sign-in account to this KBase account
      </Typography>
      <Paper className={classes['provider-link-panel']} elevation={0}>
        <Stack spacing={2}>
          <Button
            variant="outlined"
            color="base"
            size="large"
            startIcon={
              <img
                src={orcidLogo}
                alt="ORCID logo"
                className={classes['sso-logo']}
              />
            }
          >
            Link with ORCID
          </Button>
          <Button
            variant="outlined"
            color="base"
            size="large"
            startIcon={
              <img
                src={googleLogo}
                alt="Google logo"
                className={classes['sso-logo']}
              />
            }
          >
            Link with Google
          </Button>
          <Button
            variant="outlined"
            color="base"
            size="large"
            startIcon={
              <img
                src={globusLogo}
                alt="Globus logo"
                className={classes['sso-logo']}
              />
            }
          >
            Link with Globus
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};
