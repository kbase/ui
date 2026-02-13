import { faCheck, faInfoCircle, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  createToken,
  getTokens,
  revokeToken,
} from '../../common/api/authService';
import { Loader } from '../../common/components';
import { LabelValueTable } from '../../common/components/LabelValueTable';
import { useAppSelector } from '../../common/hooks';
import { useLogout } from '../login/LogIn';
import { MfaStatusIndicator } from './LogInSessions';

/**
 * Content for the Log In Sessions tab in the Account page
 */
export const ManageTokens: FC<{
  type: 'service' | 'developer';
}> = ({ type }) => {
  const token = useAppSelector(({ auth }) => auth.token ?? '');
  const tokenSessions = getTokens.useQuery(token, { skip: !token });
  const tokenType = { service: 'Service', developer: 'Developer' }[type];
  const showTokens = tokenSessions.data?.tokens.filter(
    (token) => token.type === tokenType
  );

  const [triggerCreate, createResult] = createToken.useMutation();
  const form = useForm<{ tokenName: string }>({
    defaultValues: { tokenName: undefined },
  });
  const onSubmit = form.handleSubmit((data) => {
    if (!data.tokenName) return;
    triggerCreate({ type, name: data.tokenName });
    form.reset();
  });

  // Reset form and request when token type (view) changes
  useEffect(() => {
    form.reset();
    createResult.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, form]);

  return (
    <Stack
      spacing={4}
      role="tabpanel"
      id="sessions-tabpanel"
      aria-labelledby="sessions-tab"
    >
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h2">Add a New {tokenType} Token</Typography>
        <Tooltip
          title={
            <Stack spacing={1}>
              <Typography variant="body2">N/A</Typography>
            </Stack>
          }
        >
          <Button startIcon={<FontAwesomeIcon icon={faInfoCircle} />}>
            About this tab
          </Button>
        </Tooltip>
      </Stack>
      <Card>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Stack direction="row" spacing={1} alignItems={'center'}>
              <TextField
                {...form.register('tokenName', { required: true })}
                label="Token Name"
                variant="outlined"
              />
              <Button variant="contained" type="submit">
                Create Token
              </Button>
            </Stack>
          </form>
        </CardContent>
        <CardContent>
          {createResult.data ? (
            <Alert
              variant="outlined"
              severity="success"
              onClose={() => createResult.reset()}
            >
              <Stack>
                <Typography variant="h6">
                  New {tokenType} token successfully created
                </Typography>
                <Typography variant="caption">
                  Please copy it to a secure location and remove this message.
                  The token value will not be visible once you leave this page.
                </Typography>
                <LabelValueTable
                  data={[
                    { label: 'name', value: createResult.data.name ?? '' },
                    { label: 'token', value: createResult.data.token ?? '' },
                    {
                      label: 'expires',
                      value: new Date(
                        createResult.data.expires
                      ).toLocaleString(),
                    },
                  ]}
                />
              </Stack>
            </Alert>
          ) : (
            <></>
          )}
        </CardContent>
      </Card>
      <Typography variant="h2">Active {tokenType} Tokens</Typography>
      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Created</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>MFA</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {showTokens?.map((token, i) => (
                <TableRow key={`${token.id}-${i}`}>
                  <TableCell>
                    {new Date(token.created ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(token.expires ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell>{token.name}</TableCell>
                  <TableCell>
                    {token.mfa && <MfaStatusIndicator mfa={token.mfa} />}
                  </TableCell>
                  <TableCell>
                    <RevokeButton tokenId={token.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(!showTokens || showTokens.length === 0) && (
            <i>No {type} tokens to display.</i>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

const RevokeButton = ({ tokenId }: { tokenId?: string }) => {
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
      Revoke
    </Button>
  );
};
