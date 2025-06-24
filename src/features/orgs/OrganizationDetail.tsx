import {
  Container,
  Paper,
  Stack,
  Typography,
  Box,
  Chip,
  Button,
  Tabs,
  Tab,
  Avatar,
  Link,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import { FC, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrganization } from '../../common/api/groupsApi';
import { Loader } from '../../common/components';
import { usePageTitle } from '../layout/layoutSlice';
import { RequestsTab } from './components/RequestsTab';
import { EditOrganizationDialog } from './components/EditOrganizationDialog';
import { InviteMemberDialog } from './components/InviteMemberDialog';
import { MemberManagementActions } from './components/MemberManagementActions';

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
      id={`org-tabpanel-${index}`}
      aria-labelledby={`org-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const OrganizationDetail: FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const { data: org, isLoading, error } = getOrganization.useQuery(orgId || '');

  usePageTitle(org?.name || 'Organization');

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoading) return <Loader />;

  if (error || !org) {
    return (
      <Container>
        <Typography color="error">Organization not found</Typography>
        <Button onClick={() => navigate('/orgs')}>Back to Organizations</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              {org.custom?.logourl ? (
                <img
                  src={org.custom.logourl}
                  alt={`${org.name} logo`}
                  style={{ width: 80, height: 80, objectFit: 'contain' }}
                />
              ) : (
                <Avatar sx={{ width: 80, height: 80, fontSize: '2rem' }}>
                  {org.name.charAt(0).toUpperCase()}
                </Avatar>
              )}
            </Grid>
            <Grid item sx={{ flexGrow: 1 }}>
              <Stack spacing={1}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="h4" component="h1">
                    {org.name}
                  </Typography>
                  {org.private && (
                    <Chip label="Private" color="secondary" size="small" />
                  )}
                  <Chip label={org.role} color="primary" size="small" />
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Owner: {org.owner.name}
                </Typography>

                <Stack direction="row" spacing={2}>
                  <Typography variant="body2">
                    {org.memcount} members
                  </Typography>
                  <Typography variant="body2">
                    {org.rescount?.workspace || 0} narratives
                  </Typography>
                  <Typography variant="body2">
                    {org.rescount?.catalogmethod || 0} apps
                  </Typography>
                </Stack>

                {org.custom?.researchinterests && (
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {org.custom.researchinterests}
                  </Typography>
                )}

                {org.custom?.description && (
                  <Typography variant="body2" color="text.secondary">
                    {org.custom.description}
                  </Typography>
                )}

                {org.custom?.homeurl && (
                  <Link
                    href={org.custom.homeurl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {org.custom.homeurl}
                  </Link>
                )}
              </Stack>
            </Grid>
            <Grid item>
              <Stack spacing={2}>
                {['Admin', 'Owner'].includes(org.role) && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setEditDialogOpen(true)}
                  >
                    Edit Organization
                  </Button>
                )}
                {org.role === 'None' && (
                  <Button variant="contained" size="small">
                    Request Membership
                  </Button>
                )}
                {['Admin', 'Owner'].includes(org.role) && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setInviteDialogOpen(true)}
                  >
                    Invite Users
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Members" />
            <Tab label="Narratives" />
            <Tab label="Apps" />
            {['Admin', 'Owner'].includes(org.role) && <Tab label="Requests" />}
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Members
                    </Typography>
                    <List dense>
                      {[
                        org.owner,
                        ...org.admins.slice(0, 2),
                        ...org.members.slice(0, 2),
                      ].map((member, index) => {
                        const memberType =
                          member === org.owner
                            ? 'owner'
                            : org.admins.includes(member)
                            ? 'admin'
                            : 'member';
                        return (
                          <ListItem key={`${member.name}-${index}`}>
                            <ListItemAvatar>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {member.name.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={member.name}
                              secondary={`${memberType} • Joined ${
                                member.joined
                                  ? new Date(member.joined).toLocaleDateString()
                                  : 'N/A'
                              }`}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                    {1 + org.admins.length + org.members.length > 5 && (
                      <Button size="small" onClick={() => setTabValue(1)}>
                        View all {org.memcount} members
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Narratives
                    </Typography>
                    <List dense>
                      {(org.resources?.workspace || [])
                        .slice(0, 5)
                        .map((workspace) => (
                          <ListItem key={workspace.rid}>
                            <ListItemText
                              primary={workspace.rid}
                              secondary={`Added ${
                                workspace.added
                                  ? new Date(
                                      workspace.added
                                    ).toLocaleDateString()
                                  : 'N/A'
                              }`}
                            />
                          </ListItem>
                        ))}
                    </List>
                    {(org.resources?.workspace?.length || 0) > 5 && (
                      <Button size="small" onClick={() => setTabValue(2)}>
                        View all {org.rescount?.workspace || 0} narratives
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Members ({org.memcount})
            </Typography>
            <List>
              {[
                { user: org.owner, type: 'owner' },
                ...org.admins.map((user) => ({ user, type: 'admin' })),
                ...org.members.map((user) => ({ user, type: 'member' })),
              ].map(({ user, type }, index) => (
                <div key={`${user.name}-${index}`}>
                  <ListItem
                    secondaryAction={
                      ['Admin', 'Owner'].includes(org.role) && (
                        <MemberManagementActions
                          organization={org}
                          currentUserRole={org.role}
                          targetMember={user}
                          targetMemberRole={
                            type as 'owner' | 'admin' | 'member'
                          }
                        />
                      )
                    }
                  >
                    <ListItemAvatar>
                      <Avatar>{user.name.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={`${type} • Joined ${
                        user.joined
                          ? new Date(user.joined).toLocaleDateString()
                          : 'N/A'
                      }${user.custom?.title ? ` • ${user.custom.title}` : ''}`}
                    />
                  </ListItem>
                  <Divider />
                </div>
              ))}
            </List>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Narratives ({org.rescount?.workspace || 0})
            </Typography>
            <List>
              {(org.resources?.workspace || []).map((workspace) => (
                <div key={workspace.rid}>
                  <ListItem>
                    <ListItemText
                      primary={workspace.rid}
                      secondary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="caption">
                            Added{' '}
                            {workspace.added
                              ? new Date(workspace.added).toLocaleDateString()
                              : 'N/A'}
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItem>
                  <Divider />
                </div>
              ))}
            </List>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Apps ({org.rescount?.catalogmethod || 0})
            </Typography>
            <List>
              {(org.resources?.catalogmethod || []).map((method) => (
                <div key={method.rid}>
                  <ListItem>
                    <ListItemText
                      primary={method.rid}
                      secondary={
                        method.added && (
                          <Typography variant="caption">
                            Added {new Date(method.added).toLocaleDateString()}
                          </Typography>
                        )
                      }
                    />
                  </ListItem>
                  <Divider />
                </div>
              ))}
            </List>
          </TabPanel>

          {['Admin', 'Owner'].includes(org.role) && (
            <TabPanel value={tabValue} index={4}>
              <RequestsTab groupId={org.id} />
            </TabPanel>
          )}
        </Paper>
      </Stack>

      <EditOrganizationDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        organization={org}
      />

      <InviteMemberDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        organization={org}
      />
    </Container>
  );
};
