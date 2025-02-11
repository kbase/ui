import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  isLinked,
  createLinkingSession,
  getLinkingSession,
  deleteLinkingSession,
  finishLinkingSession,
  deleteOwnLink,
  ownerLink,
} from '../../common/api/orcidlinkService';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Link,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback } from 'react';
import { useAppSelector } from '../../common/hooks';
import { skipToken } from '@reduxjs/toolkit/dist/query';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { parseError } from '../../common/api/utils/parseError';
import { Loader } from '../../common/components';
import { useAppParam } from '../params/hooks';
import { LabelValueTable } from '../../common/components/LabelValueTable';

/**
 * Content for the Log In Sessions tab in the Account page
 */
export const OrcidLink = () => {
  return (
    <Stack
      spacing={4}
      role="tabpanel"
      id="account-tabpanel"
      aria-labelledby="account-tab"
    >
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h2">OrcID Works Linking</Typography>
        <Tooltip
          title={
            <Typography variant="body2">
              Some information about orcid linking
            </Typography>
          }
        >
          <Button startIcon={<FontAwesomeIcon icon={faInfoCircle} />}>
            About this tab
          </Button>
        </Tooltip>
      </Stack>
      <Outlet />
    </Stack>
  );
};

export const OrcidLinkStatus = () => {
  const username = useAppSelector((s) => s.auth.username);

  const { data: hasLink, isLoading } = isLinked.useQuery(
    username
      ? {
          username: username,
          auth_username: username,
        }
      : skipToken
  );

  return (
    <Grid container spacing={2}>
      <Grid item sm={6}>
        {isLoading ? <Loader /> : hasLink ? <OrcidLinked /> : <OrcidUnlinked />}
      </Grid>
    </Grid>
  );
};

const OrcidLinked = () => {
  const username = useAppSelector((s) => s.auth.username);
  const { data: linkInfo } = ownerLink.useQuery(
    username ? { username, owner_username: username } : skipToken
  );

  const [triggerDelete, deleteResult] = deleteOwnLink.useMutation();
  const doDelete = useCallback(async () => {
    if (!username) return;
    const result = await triggerDelete({
      username: username,
      owner_username: username,
    });
    if ('error' in result) {
      toast(parseError(result.error).message);
    }
  }, [triggerDelete, username]);

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5" component="div">
            Your KBase ORCID Link
          </Typography>
          {linkInfo ? (
            <LabelValueTable
              data={[
                {
                  label: 'ORCID ID',
                  value: (
                    <Link href={linkFromOrcid(linkInfo.orcid_auth.orcid)}>
                      {linkFromOrcid(linkInfo.orcid_auth.orcid)}
                    </Link>
                  ),
                },
                { label: 'ORCID Name', value: linkInfo.orcid_auth.name || '' },
                {
                  label: 'Link Created',
                  value: linkInfo.created_at
                    ? new Date(linkInfo.created_at).toLocaleString()
                    : '',
                },
                {
                  label: 'Link Expires',
                  value: linkInfo.expires_at
                    ? new Date(linkInfo.expires_at).toLocaleString()
                    : '',
                },
                {
                  label: 'Permissions',
                  value: linkInfo.orcid_auth.scope ?? '',
                },
              ]}
            />
          ) : (
            <Loader />
          )}
        </Stack>
      </CardContent>
      <CardActions>
        <Button
          color="error"
          variant="outlined"
          onClick={doDelete}
          endIcon={deleteResult.isLoading ? <Loader /> : undefined}
        >
          Remove ORCID Link
        </Button>
      </CardActions>
    </Card>
  );
};

const OrcidUnlinked = () => {
  const username = useAppSelector((s) => s.auth.username);

  const [triggerCreate, createResult] = createLinkingSession.useMutation();

  const doCreate = useCallback(async () => {
    if (!username) return;
    const result = await triggerCreate({
      username: username,
      auth_username: username,
    });
    if ('data' in result) {
      const { session_id } = result.data;
      window.location.href = createStartUrl(session_id, window.location.href);
    } else {
      toast(parseError(result.error).message);
    }
  }, [triggerCreate, username]);

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5" component="div">
            Create Your KBase ORCID Link
          </Typography>
          <Typography variant="body1" component="div">
            You do not currently have a link from your KBase account to an ORCID
            account. Click the button below to being the KBase ORCID Link
            process.
          </Typography>
        </Stack>
      </CardContent>
      <CardActions>
        <Button
          color="primary"
          variant="contained"
          onClick={doCreate}
          endIcon={createResult.isLoading ? <Loader /> : undefined}
        >
          Create ORCID Link
        </Button>
      </CardActions>
    </Card>
  );
};

export const OrcidLinkContinue = () => {
  const username = useAppSelector((s) => s.auth.username);
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const { data: continueSession } = getLinkingSession.useQuery(
    sessionId && username
      ? {
          auth_username: username,
          session_id: sessionId,
        }
      : skipToken
  );

  const [triggerDelete] = deleteLinkingSession.useMutation();
  const [triggerFinish] = finishLinkingSession.useMutation();

  const doCancelSession = async () => {
    if (!sessionId || !username) return;
    const req = await triggerDelete({
      session_id: sessionId,
      auth_username: username,
    });
    if ('data' in req) {
      navigate('/account/orcidlink');
    } else {
      toast(parseError(req.error).message);
    }
  };

  const doConfirmLink = async () => {
    if (!sessionId || !username) return;
    const req = await triggerFinish({
      session_id: sessionId,
      auth_username: username,
    });
    if ('data' in req) {
      navigate('/account/orcidlink');
    } else {
      toast(parseError(req.error).message);
    }
  };

  if (continueSession) {
    if (continueSession.expires_at <= Date.now()) {
      toast('Linking session expired, please try again.');
      doCancelSession();
    }
  }
  return (
    <Grid container spacing={2}>
      <Grid item sm={6}>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h5" component="div">
                Confirm Pending Link
              </Typography>
              {continueSession ? (
                <LabelValueTable
                  data={[
                    {
                      label: 'ORCID ID',
                      value: (
                        <Link
                          href={linkFromOrcid(
                            continueSession.orcid_auth.orcid ?? ''
                          )}
                        >
                          {linkFromOrcid(
                            continueSession.orcid_auth.orcid ?? ''
                          )}
                        </Link>
                      ),
                    },
                    {
                      label: 'ORCID Name',
                      value: continueSession.orcid_auth.name || '',
                    },
                  ]}
                />
              ) : (
                <Loader />
              )}
            </Stack>
          </CardContent>
          <CardActions>
            <Button color="success" variant="contained" onClick={doConfirmLink}>
              Confirm ORCID Link
            </Button>
            <Button variant="outlined" color="error" onClick={doCancelSession}>
              Cancel Link
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );
};

export const OrcidLinkError = () => {
  const code = useAppParam('code');
  const message = useAppParam('message');
  const navigate = useNavigate();
  return (
    <Grid container spacing={2}>
      <Grid item sm={6}>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h5" component="div">
                An Error Occured During Linking
              </Typography>
              <LabelValueTable
                data={[
                  {
                    label: 'Code',
                    value: code ?? '',
                  },
                  {
                    label: 'Message',
                    value: message ?? '',
                  },
                ]}
              />
            </Stack>
          </CardContent>
          <CardActions>
            <Button
              color="error"
              variant="contained"
              onClick={() => navigate('/account/orcidlink')}
            >
              Return to OrcID Home
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );
};

const linkFromOrcid = (orcid: string) => `https://orcid.org/${orcid}`;
const createStartUrl = (session_id: string, return_link: string) =>
  `/services/orcidlink/linking-sessions/${session_id}/oauth/start?skip_prompt=false&return_link=${encodeURIComponent(
    return_link
  )}`;
