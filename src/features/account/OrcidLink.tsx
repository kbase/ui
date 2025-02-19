import {
  faCheck,
  faInfoCircle,
  faLock,
  faPlus,
  faX,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  isLinked,
  createLinkingSession,
  deleteExpiredLinkingSessions,
  getLinkingSession,
  getLinkingSessions,
  deleteLinkingSession,
  findLinks,
  finishLinkingSession,
  deleteLink,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
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
import { getMe } from '../../common/api/authService';

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
        {/* ORCID® as requested by https://info.orcid.org/brand-guidelines/ */}
        <Typography variant="h2">
          ORCID<sup>®</sup> Record Link
        </Typography>
        <Tooltip
          title={
            <Typography variant="body2">
              ORCID® is a registered trademark and the ORCID logo and iD icon
              are trademarks of{' '}
              <Link color={'inherit'} href={'https://orcid.org/'}>
                ORCID, Inc.
              </Link>
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
  const { token, username } = useAppSelector((s) => s.auth);

  const { data: hasLink, isLoading } = isLinked.useQuery(
    username
      ? {
          username: username,
          auth_username: username,
        }
      : skipToken
  );

  const { data: me } = getMe.useQuery(token ? { token } : skipToken);

  return (
    <Grid container spacing={2}>
      <Grid item sm={6}>
        {isLoading ? <Loader /> : hasLink ? <OrcidLinked /> : <OrcidUnlinked />}
      </Grid>
      <Grid item sm={6}>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h5">
                About KBase ORCID Record Links
              </Typography>
              <Typography variant="body1">
                This process adds KBase as a trusted organization with
                permissions to: <br /> 1) read your information set to visible
                to <i>trusted organizations</i>, and <br /> 2) add/update your
                research activities by adding KBase static Narrative DOI records
                to your ORCID account under the “Works” session.
              </Typography>
              <Typography variant="body1">
                After linking, you will have the ability to remove the KBase
                ORCID Record Link at any time. This is separate from using your
                ORCID account to sign into KBase, because authentication with
                ORCID and read/write with ORCID require different privileges.
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body1">
                  Helpful links to learn more:
                </Typography>
                <Link href="https://support.orcid.org/hc/en-us/articles/360006897334-What-is-an-ORCID-iD-and-how-do-I-use-it">
                  What is ORCID?
                </Link>
                <Link href="https://info.orcid.org/researcher-faq/">
                  Why use ORCID?
                </Link>
                <Link href="https://support.orcid.org/hc/en-us/articles/360006973893-Trusted-organizations">
                  What are ORCID trusted organizations?
                </Link>
                <Link href="https://docs.kbase.us/manage-account/link-accounts">
                  Signing into KBase using your ORCID account
                </Link>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      {me?.customroles?.includes('ORCIDLINK_MANAGER') ? (
        <Grid item sm={12}>
          <OrcidManage />
        </Grid>
      ) : (
        <></>
      )}
    </Grid>
  );
};

const OrcidManage = () => {
  // Might need work in the future when works-linking is acutally added
  // Super bare-bones right now.
  const linkSearch = findLinks.useQuery({ query: {} });

  const [triggerDelete, deleteResult] = deleteLink.useMutation();

  const doDelete = useCallback(
    async (username: string) => {
      const result = await triggerDelete({
        username: username,
      });
      if ('error' in result && result.error) {
        toast(parseError(result.error).message);
      }
    },
    [triggerDelete]
  );

  const linkingSessions = getLinkingSessions.useQuery();
  const [clearExpired, clearExpiredResult] =
    deleteExpiredLinkingSessions.useMutation();

  const now = Date.now();

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5">
            <FontAwesomeIcon icon={faLock} /> ORCID Record Link Management Panel
          </Typography>
          <Typography variant="h6">Linking Sessions</Typography>

          <Stack width={'20em'}>
            <LabelValueTable
              data={[
                {
                  label: 'initialized',
                  value: linkingSessions.data?.initial_linking_sessions
                    ?.length ?? <Loader></Loader>,
                },
                {
                  label: 'started',
                  value: linkingSessions.data?.started_linking_sessions
                    ?.length ?? <Loader></Loader>,
                },
                {
                  label: 'completed',
                  value: linkingSessions.data?.completed_linking_sessions
                    ?.length ?? <Loader></Loader>,
                },
                {
                  label: 'expired',
                  value: [
                    ...(linkingSessions.data?.completed_linking_sessions ?? []),
                    ...(linkingSessions.data?.started_linking_sessions ?? []),
                    ...(linkingSessions.data?.initial_linking_sessions ?? []),
                  ].filter((s) => s.expires_at < now)?.length ?? (
                    <Loader></Loader>
                  ),
                },
              ]}
            />
            <Button
              color="primary"
              variant="outlined"
              onClick={() => clearExpired()}
              endIcon={
                clearExpiredResult.isLoading ? (
                  <Loader />
                ) : clearExpiredResult.isSuccess ? (
                  <FontAwesomeIcon icon={faCheck} />
                ) : clearExpiredResult.isError ? (
                  <FontAwesomeIcon icon={faX} />
                ) : undefined
              }
            >
              Remove Expired Linking Sessions
            </Button>
          </Stack>

          <Typography variant="h6">Links</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>ORCID ID</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Retires</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(linkSearch.data?.links || []).map((link) => {
                return (
                  <TableRow key={link.orcid_auth.orcid}>
                    <TableCell>{link.username}</TableCell>
                    <TableCell>
                      <Link href={linkFromOrcid(link.orcid_auth.orcid)}>
                        {link.orcid_auth.orcid}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {new Date(link.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(link.retires_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(link.expires_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        color="error"
                        variant="outlined"
                        onClick={() => doDelete(link.username)}
                        endIcon={
                          deleteResult.originalArgs?.username ===
                            link.username && deleteResult.isLoading ? (
                            <Loader />
                          ) : undefined
                        }
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Stack>
      </CardContent>
    </Card>
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
    if ('error' in result && result.error) {
      toast(parseError(result.error).message);
    }
  }, [triggerDelete, username]);

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5">Current KBase ORCID Record Link</Typography>
          {linkInfo ? (
            <LabelValueTable
              data={[
                {
                  label: (
                    <Stack direction={'row'} gap={1} justifyContent={'end'}>
                      ORCID <OrcidIdIcon size={20} />
                    </Stack>
                  ),
                  value: (
                    <Link href={linkFromOrcid(linkInfo.orcid_auth.orcid)}>
                      {linkFromOrcid(linkInfo.orcid_auth.orcid)}
                    </Link>
                  ),
                },
                { label: 'ORCID Name', value: linkInfo.orcid_auth.name },
                {
                  label: 'Link Created',
                  value: new Date(linkInfo.created_at).toLocaleString(),
                },
                {
                  label: 'Link Expires',
                  value: new Date(linkInfo.expires_at).toLocaleString(),
                },
                {
                  label: 'Permissions',
                  value: linkInfo.orcid_auth.scope,
                },
              ]}
            />
          ) : (
            <Loader />
          )}
          <Button
            color="error"
            variant="outlined"
            onClick={doDelete}
            endIcon={deleteResult.isLoading ? <Loader /> : undefined}
          >
            Remove ORCID Record Link
          </Button>
        </Stack>
      </CardContent>
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
          <Typography variant="h5">No Current ORCID Record Link</Typography>
          <Typography variant="body1">
            Your KBase account has not been linked to an ORCID account for the
            purposes of adding works {'(e.g., static Narratives with DOIs)'}.
            Click the button below to begin the KBase ORCID Record Link process.
          </Typography>
          <Button
            color="primary"
            variant="contained"
            onClick={doCreate}
            endIcon={createResult.isLoading ? <Loader /> : undefined}
            startIcon={<FontAwesomeIcon icon={faPlus} />}
          >
            Create ORCID Record Link
          </Button>
        </Stack>
      </CardContent>
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
              <Typography variant="h5">
                Confirm Pending ORCID Record Link
              </Typography>
              {continueSession ? (
                <LabelValueTable
                  data={[
                    {
                      label: 'KBase Username',
                      value: username ?? '',
                    },
                    {
                      label: (
                        <Stack direction={'row'} gap={1} justifyContent={'end'}>
                          ORCID <OrcidIdIcon size={20} />
                        </Stack>
                      ),
                      value: (
                        <Link
                          href={linkFromOrcid(continueSession.orcid_auth.orcid)}
                        >
                          {linkFromOrcid(continueSession.orcid_auth.orcid)}
                        </Link>
                      ),
                    },
                    {
                      label: 'ORCID Name',
                      value: continueSession.orcid_auth.name,
                    },
                    {
                      label: 'Permissions',
                      value: continueSession.orcid_auth.scope,
                    },
                  ]}
                />
              ) : (
                <Loader />
              )}
              <Stack direction={'row'} spacing={2}>
                <Button
                  color="success"
                  variant="contained"
                  onClick={doConfirmLink}
                >
                  Confirm ORCID Record Link
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={doCancelSession}
                >
                  Cancel Link
                </Button>
              </Stack>
            </Stack>
          </CardContent>
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
              <Typography variant="h5">
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
              Try Again
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

const OrcidIdIcon = ({ size }: { size: number }) => {
  return (
    <svg width={size.toString()} height={size.toString()}>
      <image
        href={process.env.PUBLIC_URL + '/assets/orcidIdIcon.svg'}
        width={size.toString()}
        height={size.toString()}
      />
    </svg>
  );
};
