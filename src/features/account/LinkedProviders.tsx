import { faCheck, faInfoCircle, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Alert,
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
import { FC, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  getLinkChoice,
  getMe,
  postLinkPick,
  unlinkID,
} from '../../common/api/authService';
import { Loader } from '../../common/components';
import { useAppSelector } from '../../common/hooks';
import { ProviderButtons } from '../auth/providers';
import classes from './Account.module.scss';

/**
 * Content for the Linked Providers tab in the Account page
 */
export const LinkedProviders: FC<{ isContinueRoute?: boolean }> = ({
  isContinueRoute,
}) => {
  const token = useAppSelector(({ auth }) => auth.token ?? '');
  const { data: me } = getMe.useQuery({ token }, { skip: !token });

  const identities = me?.idents;

  const { loginOrigin, loginActionUrl, loginRedirectUrl } = makeLinkURLs();
  const { linkPending, targetLinkProvider, targetLink } =
    useManageLinkContinue(isContinueRoute);
  const unklinkOk = (identities?.length ?? 0) > 1;

  return (
    <Stack
      spacing={4}
      role="tabpanel"
      id="providers-tabpanel"
      aria-labelledby="providers-tab"
    >
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
          {identities?.map(({ provider, provusername, id }, i) => (
            <TableRow key={`${provider}-${i}`}>
              <TableCell>{provider}</TableCell>
              <TableCell>{provusername}</TableCell>
              <TableCell>
                <UnlinkButton id={id} unklinkOk={unklinkOk} />
              </TableCell>
            </TableRow>
          ))}
          {linkPending ? (
            <TableRow>
              <TableCell>{targetLinkProvider}</TableCell>
              <TableCell>{targetLink?.provusername}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="info"
                  endIcon={<Loader loading={true} type="spinner" />}
                >
                  Linking
                </Button>
              </TableCell>
            </TableRow>
          ) : undefined}
        </TableBody>
      </Table>
      <Typography variant="h2">
        Link an additional sign-in account to this KBase account
      </Typography>
      {process.env.NODE_ENV === 'development' ? (
        <Alert severity="error">
          DEV MODE: Link will occur on {loginOrigin}
        </Alert>
      ) : (
        <></>
      )}
      <Paper className={classes['provider-link-panel']} elevation={0}>
        <form
          action={loginActionUrl.toString()}
          method="post"
          data-testid="linkForm"
        >
          <ProviderButtons text={(provider) => `Link with ${provider}`} />
          <input
            readOnly
            hidden
            name="redirecturl"
            value={loginRedirectUrl.toString()}
            data-testid="redirecturl"
          />
        </form>
      </Paper>
    </Stack>
  );
};

const UnlinkButton = ({
  id,
  unklinkOk,
}: {
  id: string;
  unklinkOk: boolean;
}) => {
  const token = useAppSelector(({ auth }) => auth.token ?? '');
  const [triggerUnlink, unlink] = unlinkID.useMutation();
  return (
    <Button
      variant="contained"
      color="error"
      {...(unklinkOk
        ? {
            onClick: () => {
              triggerUnlink({ token, id });
            },
          }
        : {
            disabled: true,
            title:
              'Since this is the only external sign-in account linked to your KBase account, you cannot unlink it',
          })}
      endIcon={
        unlink.isLoading ? (
          <Loader loading={true} type="spinner" />
        ) : unlink.isSuccess ? (
          <FontAwesomeIcon icon={faCheck} />
        ) : unlink.isError ? (
          <FontAwesomeIcon icon={faX} />
        ) : undefined
      }
    >
      Unlink
    </Button>
  );
};

const useManageLinkContinue = (isContinueRoute = false) => {
  const token = useAppSelector(({ auth }) => auth.token ?? '');
  const choiceResult = getLinkChoice.useQuery(undefined, {
    skip: !isContinueRoute,
  });
  const [triggerLink, linkPick] = postLinkPick.useMutation();

  const linkOk = (choiceResult.data?.linked.length ?? 0) < 1;
  const targetLinkProvider = choiceResult.data?.provider;
  const targetLink = choiceResult.data?.idents?.[0] ?? undefined;
  const priorLinkProvUsername = choiceResult.data?.linked?.[0]?.provusername;
  const otherUser = choiceResult.data?.linked?.[0]?.user;

  useEffect(() => {
    if (targetLink && linkOk) {
      triggerLink({ token, id: targetLink.id });
    }
    if (!linkOk) {
      toast(
        `Cannot link ${targetLinkProvider} account "${priorLinkProvUsername}". Already linked to account ${otherUser}`
      );
    }
  }, [
    linkOk,
    targetLinkProvider,
    otherUser,
    priorLinkProvUsername,
    targetLink,
    token,
    triggerLink,
  ]);

  return {
    linkPending: choiceResult.isLoading || linkPick.isLoading,
    targetLinkProvider,
    targetLink,
  };
};

export const makeLinkURLs = (nextRequest?: string) => {
  // OAuth Login wont work in dev mode, so redirect to ci
  const loginOrigin =
    process.env.NODE_ENV === 'development'
      ? 'https://ci.kbase.us'
      : document.location.origin;

  // Triggering login requires a form POST submission
  const loginActionUrl = new URL('/services/auth/link/start/', loginOrigin);

  // Redirect URL is used to pass state to link/continue
  const loginRedirectUrl = new URL(
    `${loginOrigin}/account/providers/link/continue`
  );
  loginRedirectUrl.searchParams.set(
    'state',
    JSON.stringify({
      nextRequest: nextRequest,
      origin: loginOrigin,
    })
  );

  return { loginOrigin, loginActionUrl, loginRedirectUrl };
};
