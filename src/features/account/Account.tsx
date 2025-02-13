import { Container, Stack, Tab, Tabs } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/dist/query';
import { FC } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getMe } from '../../common/api/authService';
import { useAppSelector } from '../../common/hooks';
import { usePageTitle } from '../layout/layoutSlice';

/**
 * Main Account page with four subpages represented as tabs.
 */
export const Account: FC = () => {
  usePageTitle('Account');
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAppSelector((s) => s.auth.token);
  const { data: me } = getMe.useQuery(token ? { token } : skipToken);

  const handleChange = (event: React.SyntheticEvent, tabValue: string) => {
    navigate(tabValue);
    document.querySelector('main')?.scrollTo(0, 0);
  };
  const currentTabValue = (location.pathname.match(/\/account\/[^/]*/) || [
    undefined,
  ])[0];

  return (
    <Container maxWidth="lg">
      <Stack spacing={4}>
        <Tabs value={currentTabValue} onChange={handleChange}>
          <Tab
            value={'/account/info'}
            component="a"
            label="Account"
            id="account-tab"
            aria-controls="account-tabpanel"
          />
          <Tab
            value={'/account/providers'}
            label="Linked Providers"
            id="providers-tab"
            aria-controls="providers-tabpanel"
          />
          <Tab
            value={'/account/sessions'}
            label="Log In Sessions"
            id="sessions-tab"
            aria-controls="sessions-tabpanel"
          />
          <Tab
            value={'/account/use-agreements'}
            label="Use Agreements"
            id="use-agreements-tab"
            aria-controls="use-agreements-tabpanel"
          />
          <Tab
            value={'/account/orcidlink'}
            label="ORCID Record Link"
            id="orcidlink"
            aria-controls="orcidlink-tabpanel"
          />
          {me?.roles.some((r) => r.id === 'DevToken') ? (
            <Tab
              value={'/account/dev-tokens'}
              label="Developer Tokens"
              id="dev-tokens"
              aria-controls="dev-tokens-tabpanel"
            />
          ) : undefined}
          {me?.roles.some((r) => r.id === 'ServToken') ? (
            <Tab
              value={'/account/service-tokens'}
              label="Service Tokens"
              id="service-tokens"
              aria-controls="service-tokens-tabpanel"
            />
          ) : undefined}
        </Tabs>
        <Outlet />
      </Stack>
    </Container>
  );
};
