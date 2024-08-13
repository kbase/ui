import { Container, Stack, Tab, Tabs } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { usePageTitle } from '../layout/layoutSlice';

/**
 * Main Account page with four subpages represented as tabs.
 */
export const Account: FC = () => {
  usePageTitle('Account');
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    switch (location.pathname) {
      case '/account/info':
        return 0;
      case '/account/providers':
        return 1;
      case '/account/logins':
        return 2;
      case '/account/use-agreements':
        return 3;
      default:
        return 0;
    }
  });

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
        </Tabs>
        <Outlet />
      </Stack>
    </Container>
  );
};
