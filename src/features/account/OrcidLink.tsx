import { faInfoCircle, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  isLinked,
  createLinkingSession,
  getLinkingSession,
  deleteLinkingSession,
  finishLinkingSession,
  deleteOwnLink,
} from '../../common/api/orcidlinkService';
import { Button, Stack, Tooltip, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useAppSelector } from '../../common/hooks';
import { skipToken } from '@reduxjs/toolkit/dist/query';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { parseError } from '../../common/api/utils/parseError';
import { Loader } from '../../common/components';

/**
 * Content for the Log In Sessions tab in the Account page
 */
export const OrcidLink = () => {
  const username = useAppSelector((s) => s.auth.username);

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
      <Typography variant="h2">Link Info</Typography>
      <Stack spacing={2}>
        <Stack>
          <Typography fontWeight="bold">KBase Username</Typography>
          <Typography>{username}</Typography>
          <Typography fontWeight="bold">OrcID Link Status</Typography>
          <Outlet />
        </Stack>
      </Stack>
    </Stack>
  );
};

const createStartUrl = (session_id: string, return_link: string) =>
  `/services/orcidlink/linking-sessions/${session_id}/oauth/start?skip_prompt=false&return_link=${encodeURIComponent(
    return_link
  )}`;

export const OrcidLinkStatus = () => {
  const username = useAppSelector((s) => s.auth.username);

  // Link Start (createLinkingSession)
  const { data: hasLink } = isLinked.useQuery(
    username
      ? {
          username: username,
          auth_username: username,
        }
      : skipToken
  );

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
    <Typography>
      {hasLink ? (
        <>
          <Button color="success" variant="outlined">
            Already Linked
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={doDelete}
            endIcon={
              deleteResult.isLoading ? (
                <Loader />
              ) : deleteResult.error ? (
                <FontAwesomeIcon icon={faX} />
              ) : null
            }
            disabled={deleteResult.isLoading}
          >
            Remove Link
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="contained"
            onClick={doCreate}
            endIcon={
              createResult.isLoading ? (
                <Loader />
              ) : createResult.error ? (
                <FontAwesomeIcon icon={faX} />
              ) : null
            }
            disabled={createResult.isLoading}
          >
            Create Link
          </Button>
        </>
      )}
    </Typography>
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
    <Stack>
      <Typography>Pending Link to KBase username "{username}"</Typography>
      <Typography>OrcID: {continueSession?.orcid_auth.orcid}</Typography>
      <Typography>Name: {continueSession?.orcid_auth.name}</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={doConfirmLink}>
          Confirm Link
        </Button>
        <Button variant="outlined" color="error" onClick={doCancelSession}>
          Cancel Link
        </Button>
      </Stack>
    </Stack>
  );
};
