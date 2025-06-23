import {
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
  FormControl,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  FormGroup,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../layout/layoutSlice';
import {
  BriefOrganization,
  Filter,
  OrganizationQuery,
  listOrganizations,
} from '../../common/api/orgsApi';
import { Loader } from '../../common/components';

export const Orgs: FC = () => {
  usePageTitle('Organizations');
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('recentlyChanged');
  const [filter, setFilter] = useState<Filter>({
    roleType: 'myorgs',
    roles: [],
    privacy: 'any',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const query: OrganizationQuery = useMemo(
    () => ({
      searchTerms: searchText.split(/\s+/).filter(Boolean),
      sortField: sortBy,
      sortDirection: 'descending' as const,
      filter,
    }),
    [searchText, sortBy, filter]
  );

  const { data, isLoading, error } = listOrganizations.useQuery(query);

  const handleSearchChange = useCallback((value: string) => {
    setSearchText(value);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value);
  }, []);

  const handleFilterChange = useCallback((newFilter: Partial<Filter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  }, []);

  const handleCreateOrg = useCallback(() => {
    navigate('/orgs/new');
  }, [navigate]);

  const handleOrgClick = useCallback(
    (orgId: string) => {
      navigate(`/orgs/${orgId}`);
    },
    [navigate]
  );

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <Container>
        <Typography color="error">Error loading organizations</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h1">
            Organizations
          </Typography>
          <Button
            variant="contained"
            startIcon={<FontAwesomeIcon icon={faPlus} />}
            onClick={handleCreateOrg}
          >
            Create Organization
          </Button>
        </Box>

        <Typography variant="subtitle1" color="text.secondary">
          Explore, collaborate, and organize your research with KBase
          organizations.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={9}>
            <Stack spacing={2}>
              <Paper sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    placeholder="Search Organizations"
                    value={searchText}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <FontAwesomeIcon
                          icon={faSearch}
                          style={{
                            marginRight: 8,
                            color: 'rgba(0, 0, 0, 0.38)',
                          }}
                        />
                      ),
                    }}
                    size="small"
                    sx={{ flexGrow: 1 }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minWidth: 'max-content' }}
                  >
                    {data?.organizations.length === data?.total
                      ? `${data?.total || 0} orgs`
                      : `${data?.organizations.length || 0}/${
                          data?.total || 0
                        } orgs`}
                  </Typography>
                </Stack>
              </Paper>

              <Grid container spacing={2}>
                {data?.organizations.map((org) => (
                  <Grid key={org.id} item xs={12} sm={6} md={4}>
                    <OrganizationCard
                      org={org}
                      onClick={() => handleOrgClick(org.id)}
                    />
                  </Grid>
                ))}
              </Grid>

              {data?.organizations.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    No organizations found
                  </Typography>
                  <Typography color="text.secondary">
                    Try adjusting your search terms or filters
                  </Typography>
                </Paper>
              )}
            </Stack>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Stack spacing={3}>
                <div>
                  <Typography variant="subtitle2" gutterBottom>
                    Sort by
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                    >
                      <MenuItem value="recentlyChanged">Date Changed</MenuItem>
                      <MenuItem value="recentlyAdded">
                        Date Established
                      </MenuItem>
                      <MenuItem value="name">Org Name</MenuItem>
                      <MenuItem value="memberCount"># members</MenuItem>
                      <MenuItem value="narrativeCount"># narratives</MenuItem>
                      <MenuItem value="appCount"># apps</MenuItem>
                    </Select>
                  </FormControl>
                </div>

                <div>
                  <Typography variant="subtitle2" gutterBottom>
                    Filter
                  </Typography>
                  <RadioGroup
                    value={filter.roleType}
                    onChange={(e) =>
                      handleFilterChange({
                        roleType: e.target.value as Filter['roleType'],
                      })
                    }
                  >
                    <FormControlLabel
                      value="myorgs"
                      control={<Radio />}
                      label="My Orgs"
                    />
                    <FormControlLabel
                      value="all"
                      control={<Radio />}
                      label="All Orgs"
                    />
                    {showAdvanced && (
                      <>
                        <FormControlLabel
                          value="notmyorgs"
                          control={<Radio />}
                          label="Not My Orgs"
                        />
                        <FormControlLabel
                          value="select"
                          control={<Radio />}
                          label="Specific Role"
                        />
                      </>
                    )}
                  </RadioGroup>

                  {showAdvanced && filter.roleType === 'select' && (
                    <FormGroup sx={{ ml: 2, mt: 1 }}>
                      {['member', 'admin', 'owner'].map((role) => (
                        <FormControlLabel
                          key={role}
                          control={
                            <Checkbox
                              checked={filter.roles.includes(role)}
                              onChange={(e) => {
                                const newRoles = e.target.checked
                                  ? [...filter.roles, role]
                                  : filter.roles.filter((r) => r !== role);
                                handleFilterChange({ roles: newRoles });
                              }}
                            />
                          }
                          label={role.charAt(0).toUpperCase() + role.slice(1)}
                        />
                      ))}
                    </FormGroup>
                  )}
                </div>

                {showAdvanced && (
                  <div>
                    <Typography variant="subtitle2" gutterBottom>
                      Visibility
                    </Typography>
                    <RadioGroup
                      value={filter.privacy}
                      onChange={(e) =>
                        handleFilterChange({
                          privacy: e.target.value as Filter['privacy'],
                        })
                      }
                    >
                      <FormControlLabel
                        value="any"
                        control={<Radio />}
                        label="Any"
                      />
                      <FormControlLabel
                        value="public"
                        control={<Radio />}
                        label="Visible"
                      />
                      <FormControlLabel
                        value="private"
                        control={<Radio />}
                        label="Hidden"
                      />
                    </RadioGroup>
                  </div>
                )}

                <Button
                  variant="text"
                  size="small"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {showAdvanced ? 'show fewer options' : 'show more options'}
                </Button>

                <Divider />
                <Button
                  href="https://docs.kbase.us/getting-started/narrative/orgs"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="text"
                  size="small"
                  sx={{ alignSelf: 'center' }}
                >
                  FAQ
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
};

const OrganizationCard: FC<{
  org: BriefOrganization;
  onClick: () => void;
}> = ({ org, onClick }) => {
  return (
    <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={onClick}>
      <CardContent>
        <Stack spacing={2}>
          <Box display="flex" alignItems="center" gap={1}>
            {org.logoUrl && (
              <img
                src={org.logoUrl}
                alt={`${org.name} logo`}
                style={{ width: 40, height: 40, objectFit: 'contain' }}
              />
            )}
            <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
              {org.name}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" noWrap>
            Owner: {org.owner.realname || org.owner.username}
          </Typography>

          {org.researchInterests && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {org.researchInterests}
            </Typography>
          )}

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label={`${org.memberCount} members`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${org.narrativeCount} narratives`}
              size="small"
              variant="outlined"
            />
            {org.isPrivate && (
              <Chip label="Private" size="small" color="secondary" />
            )}
          </Stack>

          {org.relation !== 'None' && (
            <Chip
              label={org.relation}
              size="small"
              color="primary"
              sx={{ alignSelf: 'flex-start' }}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
