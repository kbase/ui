import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  isLinked,
  createLinkingSession,
} from '../../common/api/orcidlinkService';
import { Button, Stack, Tooltip, Typography } from '@mui/material';
import { FC, useCallback } from 'react';
import { useAppSelector } from '../../common/hooks';
import { skipToken } from '@reduxjs/toolkit/dist/query';

/**
 * Content for the Log In Sessions tab in the Account page
 */
export const OrcidLink: FC = () => {
  const username = useAppSelector((s) => s.auth.username);
  const { data: hasLink } = isLinked.useQuery(
    username
      ? {
          username: username,
          auth_username: username,
        }
      : skipToken
  );
  const [triggerCreate, createResult] = createLinkingSession.useMutation();

  const onCreate = useCallback(() => {
    if (!username) return;
    triggerCreate({ username: username, auth_username: username });
  }, [triggerCreate, username]);

  const createUrl = (session_id: string, return_link: string) =>
    `/services/orcidlink/linking-sessions/${session_id}/oauth/start?skip_prompt=false&return_link=${encodeURIComponent(
      return_link
    )}`;

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
          <Typography>
            {hasLink ? (
              <Button color="success" variant="outlined">
                Already Linked
              </Button>
            ) : (
              <>
                <Button variant="contained" onClick={onCreate}>
                  Create Link
                </Button>
                {createResult.data?.session_id ? (
                  <a
                    href={createUrl(
                      createResult.data.session_id,
                      window.location.href
                    )}
                  >
                    Do Link
                  </a>
                ) : null}
              </>
            )}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};
