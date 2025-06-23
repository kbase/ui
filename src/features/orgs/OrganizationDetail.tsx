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
import { useGetOrganizationQuery } from '../../common/api/orgsApi';
import { Loader } from '../../common/components';
import { usePageTitle } from '../layout/layoutSlice';

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

  const { data: org, isLoading, error } = useGetOrganizationQuery(orgId || '');

  usePageTitle(org?.name || 'Organization');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
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
              {org.logoUrl ? (
                <img
                  src={org.logoUrl}
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
                  {org.isPrivate && (
                    <Chip label="Private" color="secondary" size="small" />
                  )}
                  <Chip label={org.relation} color="primary" size="small" />
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Owner: {org.owner.realname || org.owner.username}
                </Typography>

                <Stack direction="row" spacing={2}>
                  <Typography variant="body2">
                    {org.memberCount} members
                  </Typography>
                  <Typography variant="body2">
                    {org.narrativeCount} narratives
                  </Typography>
                  <Typography variant="body2">{org.appCount} apps</Typography>
                </Stack>

                {org.researchInterests && (
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {org.researchInterests}
                  </Typography>
                )}

                {org.description && (
                  <Typography variant="body2" color="text.secondary">
                    {org.description}
                  </Typography>
                )}

                {org.homeUrl && (
                  <Link
                    href={org.homeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {org.homeUrl}
                  </Link>
                )}
              </Stack>
            </Grid>
            <Grid item>
              <Stack spacing={2}>
                {(org.isAdmin || org.isOwner) && (
                  <Button variant="outlined" size="small">
                    Edit Organization
                  </Button>
                )}
                {org.relation === 'None' && (
                  <Button variant="contained" size="small">
                    Request Membership
                  </Button>
                )}
                {(org.isAdmin || org.isOwner) && (
                  <Button variant="outlined" size="small">
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
            {(org.isAdmin || org.isOwner) && <Tab label="Requests" />}
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
                      {org.members.slice(0, 5).map((member) => (
                        <ListItem key={member.username}>
                          <ListItemAvatar>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {member.realname?.charAt(0) ||
                                member.username.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={member.realname || member.username}
                            secondary={`${member.type} • Joined ${new Date(
                              member.joinedAt
                            ).toLocaleDateString()}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                    {org.members.length > 5 && (
                      <Button size="small" onClick={() => setTabValue(1)}>
                        View all {org.memberCount} members
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
                      {org.narratives.slice(0, 5).map((narrative) => (
                        <ListItem key={narrative.workspaceId}>
                          <ListItemText
                            primary={narrative.title}
                            secondary={`Updated ${new Date(
                              narrative.updatedAt
                            ).toLocaleDateString()}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                    {org.narratives.length > 5 && (
                      <Button size="small" onClick={() => setTabValue(2)}>
                        View all {org.narrativeCount} narratives
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Members ({org.memberCount})
            </Typography>
            <List>
              {org.members.map((member) => (
                <div key={member.username}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        {member.realname?.charAt(0) ||
                          member.username.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={member.realname || member.username}
                      secondary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={member.type} size="small" />
                          {member.title && (
                            <Typography variant="caption">
                              {member.title}
                            </Typography>
                          )}
                          <Typography variant="caption">
                            Joined{' '}
                            {new Date(member.joinedAt).toLocaleDateString()}
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

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Narratives ({org.narrativeCount})
            </Typography>
            <List>
              {org.narratives.map((narrative) => (
                <div key={narrative.workspaceId}>
                  <ListItem>
                    <ListItemText
                      primary={narrative.title}
                      secondary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={narrative.permission}
                            size="small"
                            variant="outlined"
                          />
                          {narrative.isPublic && (
                            <Chip label="Public" size="small" color="success" />
                          )}
                          <Typography variant="caption">
                            Updated{' '}
                            {new Date(narrative.updatedAt).toLocaleDateString()}
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
              Apps ({org.appCount})
            </Typography>
            <List>
              {org.apps.map((app) => (
                <div key={app.appId}>
                  <ListItem>
                    <ListItemText
                      primary={app.appId}
                      secondary={
                        app.addedAt && (
                          <Typography variant="caption">
                            Added {new Date(app.addedAt).toLocaleDateString()}
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

          {(org.isAdmin || org.isOwner) && (
            <TabPanel value={tabValue} index={4}>
              <Typography variant="h6" gutterBottom>
                Requests
              </Typography>
              <Typography color="text.secondary">
                Request management functionality coming soon...
              </Typography>
            </TabPanel>
          )}
        </Paper>
      </Stack>
    </Container>
  );
};
