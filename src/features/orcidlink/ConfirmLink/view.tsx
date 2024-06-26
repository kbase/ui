/**
 * This component implements the ConfirmLink component's user interface.
 *
 * The main task of this component is to allow the user to finalize their link.
 * It presents the current link information for the user to inspect, a button to
 * create the link, and a button to cancel the linking process. It also provides
 * a countdown timer, as a linking session has a 10 minute lifetime.
 */
import {
  faClock,
  faFlagCheckered,
  faMailReply,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  InfoResult,
  LinkingSessionPublicComplete,
} from '../common/api/ORCIDLInkAPI';
import CountdownClock from '../common/CountdownClock';
import Loading from '../common/Loading';
import ORCIDId from '../common/ORCIDId';
import { ORCIDIdLink } from '../common/ORCIDIdLink';
import Scopes from '../common/Scopes';
import styles from '../common/styles.module.scss';

export interface ConfirmLinkProps {
  sessionId: string;
  info: InfoResult;
  session: LinkingSessionPublicComplete;
  doCancelSession: () => Promise<void>;
  canceling: boolean;
  doFinishSession: () => Promise<void>;
  finishing: boolean;
}

export default function ConfirmLink({
  sessionId,
  info,
  session,
  doCancelSession,
  canceling,
  doFinishSession,
  finishing,
}: ConfirmLinkProps) {
  function renderORCIDUserRecord() {
    return (
      <Table>
        <TableBody>
          <TableRow>
            <TableCell variant="head">ORCID® iD</TableCell>
            <TableCell>
              <ORCIDIdLink
                url={info.runtime_info.orcid_site_url}
                orcidId={session.orcid_auth.orcid}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell variant="head">Name</TableCell>
            <TableCell>
              {session.orcid_auth.name || <i>not public</i>}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  function renderMessage() {
    if (canceling) {
      return (
        <Box sx={{ mt: 2 }}>
          <Loading
            title="Canceling..."
            message="Attempting to cancel your linking session"
          />
        </Box>
      );
    } else if (finishing) {
      return (
        <Box sx={{ mt: 2 }}>
          <Loading
            title="Finishing..."
            message="Attempting to create your KBase ORCID Link"
          />
        </Box>
      );
    } else {
      return;
    }
  }

  function renderTimeRemaining() {
    return (
      <Box sx={{ mb: 2 }}>
        <Alert color="info" icon={<FontAwesomeIcon icon={faClock} />}>
          The linking session expires in{' '}
          <b>
            <CountdownClock
              startAt={session.created_at}
              endAt={session.expires_at}
              onExpired={() => {
                doCancelSession();
              }}
            />
          </b>
        </Alert>
      </Box>
    );
  }

  return (
    <Box className={styles.paper} sx={{ p: 4 }}>
      <Grid container rowSpacing={2} columnSpacing={2}>
        <Grid xs={6}>
          <Card variant="outlined">
            <CardHeader title="Create Your KBase ORCID® Link!" />
            <CardContent>
              {/* {this.renderPendingProgress()} */}
              <Typography fontWeight="bold">
                Your ORCID® account{' '}
                <ORCIDId orcidId={session.orcid_auth.orcid} /> is ready for
                linking to your KBase account {session.username}.
              </Typography>
              <p>
                By linking the ORCID® account above you will be granting KBase
                the ability to interact with that account on your behalf. You
                may revoke this at any time.
              </p>
              <p>
                By default, your ORCID® iD will be displayed in your User
                Profile and may be displayed in other contexts in which your
                account is displayed. You may opt out below. After linking, you
                can change this setting in either the KBase ORCID® Link or User
                Profile tool.
              </p>
              <Grid container rowSpacing={2} columnSpacing={2}>
                <Grid xs={4}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label=" Show in User Profile"
                    sx={{ ms: 1 }}
                    onChange={() => {
                      // toggleShowInProfile();
                      // NOOP - not implemented yet
                    }}
                  />
                </Grid>
                <Grid xs={8}>
                  <p>
                    When this option is enabled your ORCID® iD will be displayed
                    in{' '}
                    <Link
                      to="/legacy/people"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      your User Profile
                    </Link>
                  </p>
                  <p>
                    You may change this option at time (after you have created
                    the link), either here in the KBase ORCID Link tool or
                    directly in your User Profile.
                  </p>
                </Grid>
              </Grid>
            </CardContent>
            <CardActions style={{ justifyContent: 'center' }} sx={{ p: 2 }}>
              <div style={{ flex: '1 1 0', flexDirection: 'column' }}>
                {renderTimeRemaining()}

                <div style={{ flex: '1 1 0', flexDirection: 'column' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}
                  >
                    <Button
                      variant="outlined"
                      type="button"
                      color="error"
                      sx={{ mr: 1 }}
                      onClick={() => {
                        doCancelSession();
                      }}
                      disabled={canceling || finishing}
                      startIcon={
                        <FontAwesomeIcon icon={faMailReply} size="lg" />
                      }
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      type="button"
                      onClick={() => {
                        doFinishSession();
                      }}
                      disabled={canceling || finishing}
                      endIcon={
                        <FontAwesomeIcon icon={faFlagCheckered} size="lg" />
                      }
                    >
                      Finish Creating Your KBase ORCID® Link{' '}
                    </Button>
                  </div>

                  {renderMessage()}
                </div>
              </div>
            </CardActions>
          </Card>
        </Grid>
        <Grid xs={6}>
          <Card variant="outlined">
            <CardHeader title="Your ORCID® Account" />
            <CardContent>
              <p>
                The following ORCID® account will be linked to this KBase
                account.
              </p>

              <p>
                You may follow the <b>ORCID® iD</b> link below to inspect
                additional information about the account.
              </p>

              {renderORCIDUserRecord()}
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardHeader title="Scopes being granted to KBase" />
            <CardContent>
              <p>
                KBase is requesting the &quot;scopes&quot; below to view or
                manipulate your ORCID® account. A scope is a set of permissions
                to access your ORCID® account.
              </p>

              <p>
                Note that that interaction with your ORCID® account will only be
                conducted while you are logged in, in response to direct actions
                you take, and we will always inform you when this is the case.
              </p>

              <Scopes scopes={session.orcid_auth.scope} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
