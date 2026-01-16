import { FC, useState } from 'react';
import { Box, Tabs, Tab, Badge } from '@mui/material';
import { RequestInbox } from './RequestInbox';
import { RequestOutbox } from './RequestOutbox';
import {
  getRequests,
  getUserOutgoingRequests,
} from '../../../common/api/groupsApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`requests-tabpanel-${index}`}
      aria-labelledby={`requests-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

interface RequestsTabProps {
  groupId: string;
}

export const RequestsTab: FC<RequestsTabProps> = ({ groupId }) => {
  const [tabValue, setTabValue] = useState(0);

  const { data: incomingRequests = [] } = getRequests.useQuery(groupId);
  const { data: outgoingRequests = [] } = getUserOutgoingRequests.useQuery();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const pendingIncoming = incomingRequests.filter(
    (req) => req.status === 'pending'
  ).length;
  const pendingOutgoing = outgoingRequests.filter(
    (req) => req.groupId === groupId && req.status === 'pending'
  ).length;

  return (
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab
          label={
            <Badge badgeContent={pendingIncoming} color="error">
              Inbox
            </Badge>
          }
        />
        <Tab
          label={
            <Badge badgeContent={pendingOutgoing} color="warning">
              Outbox
            </Badge>
          }
        />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <RequestInbox groupId={groupId} requests={incomingRequests} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <RequestOutbox groupId={groupId} requests={outgoingRequests} />
      </TabPanel>
    </Box>
  );
};
