import { Container, Stack, Tab, Tabs } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { AccountInfo } from './AccountInfo';
import { LinkedProviders } from './LinkedProviders';
import { LogInSessions } from './LogInSessions';

/**
 * Main Account page with four subpages represented as tabs.
 */
export const Account: FC = () => {
  const [activeTab, setActiveTab] = useState(0);

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
            label="Account"
            id="account-tab"
            aria-controls="account-tabpanel"
          />
          <Tab
            label="Linked Providers"
            id="providers-tab"
            aria-controls="providers-tabpanel"
          />
          <Tab
            label="Log In Sessions"
            id="logins-tab"
            aria-controls="logins-tabpanel"
          />
          <Tab
            label="Use Agreements"
            id="use-agreements-tab"
            aria-controls="use-agreements-tabpanel"
          />
        </Tabs>
        <CustomTabPanel value={activeTab} index={0} name="account">
          <AccountInfo />
        </CustomTabPanel>
        <CustomTabPanel value={activeTab} index={1} name="providers">
          <LinkedProviders />
        </CustomTabPanel>
        <CustomTabPanel value={activeTab} index={2} name="logins">
          <LogInSessions />
        </CustomTabPanel>
      </Stack>
    </Container>
  );
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  name: string;
}

/**
 * Tab panel wrapper that conditionally displays tab content
 * depending on the active tab.
 */
const CustomTabPanel: FC<TabPanelProps> = ({
  value,
  index,
  name,
  children,
  ...rest
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`${name}-tabpanel`}
      aria-labelledby={`${name}-tab`}
      {...rest}
    >
      {value === index && children}
    </div>
  );
};
