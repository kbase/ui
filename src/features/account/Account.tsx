import { Container, Stack, Tab, Tabs } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/dist/query';
import { FC, useEffect, useState } from 'react';
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
  const tabs = [
    '/account/info',
    '/account/providers',
    '/account/logins',
    '/account/use-agreements',
    '/account/orcidlink',
    // Optional Tabs
    '/account/dev-tokens',
    '/account/service-tokens',
  ];
  const defaultTab = tabs.findIndex((tabPath) =>
    location.pathname.startsWith(tabPath)
  );
  const [activeTab, setActiveTab] = useState(
    defaultTab === -1 ? 0 : defaultTab
  );

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    document.querySelector('main')?.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <Container maxWidth="lg">
      <Stack spacing={4}>
        <Tabs value={activeTab} onChange={handleChange}>
          <Tab
            component="a"
            label="Account"
            id="account-tab"
            aria-controls="account-tabpanel"
            onClick={() => navigate('info')}
          />
          <Tab
            component="a"
            label="Linked Providers"
            id="providers-tab"
            aria-controls="providers-tabpanel"
            onClick={() => navigate('providers')}
          />
          <Tab
            component="a"
            label="Log In Sessions"
            id="sessions-tab"
            aria-controls="sessions-tabpanel"
            onClick={() => navigate('sessions')}
          />
          <Tab
            component="a"
            label="Use Agreements"
            id="use-agreements-tab"
            aria-controls="use-agreements-tabpanel"
            onClick={() => navigate('use-agreements')}
          />
          <Tab
            component="a"
            label="ORCID Record Link"
            id="orcidlink"
            aria-controls="orcidlink-tabpanel"
            onClick={() => navigate('orcidlink')}
          />
          {me?.roles.some((r) => r.id === 'ServToken') ? (
            <Tab
              component="a"
              label="Service Tokens"
              id="service-tokens"
              aria-controls="service-tokens-tabpanel"
              onClick={() => navigate('service-tokens')}
            />
          ) : (
            <></>
          )}
          {me?.roles.some((r) => r.id === 'DevToken') ? (
            <Tab
              component="a"
              label="Developer Tokens"
              id="dev-tokens"
              aria-controls="dev-tokens-tabpanel"
              onClick={() => navigate('dev-tokens')}
            />
          ) : (
            <></>
          )}
        </Tabs>
        <Outlet />
      </Stack>
    </Container>
  );
};
