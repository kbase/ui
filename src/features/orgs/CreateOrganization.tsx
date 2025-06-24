import {
  Container,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Box,
  Alert,
} from '@mui/material';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { usePageTitle } from '../layout/layoutSlice';
import {
  createOrganization,
  CreateOrganizationInput,
} from '../../common/api/groupsApi';

const defaultValues: CreateOrganizationInput = {
  id: '',
  name: '',
  logoUrl: '',
  homeUrl: '',
  researchInterests: '',
  description: '',
  isPrivate: false,
};

export const CreateOrganization: FC = () => {
  usePageTitle('Create Organization');
  const navigate = useNavigate();
  const [trigger, { isLoading, error }] = createOrganization.useMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrganizationInput>({
    defaultValues,
    mode: 'onBlur',
  });

  const isValidUrl = (value: string | undefined): boolean | string => {
    if (!value) return true; // Allow empty values for optional fields
    try {
      new URL(value);
      return true;
    } catch (_) {
      return 'Please enter a valid URL';
    }
  };

  const onSubmit = async (data: CreateOrganizationInput) => {
    try {
      const result = await trigger(data).unwrap();
      navigate(`/orgs/${result.id}`);
    } catch (err) {
      // Error is handled by RTK Query and displayed via the error state
    }
  };

  const handleCancel = () => {
    navigate('/orgs');
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Typography variant="h4" component="h1">
            Create New Organization
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Organizations help you collaborate and share resources with your
            team.
          </Typography>

          {error && (
            <Alert severity="error">
              Failed to create organization. Please try again.
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <Controller
                name="id"
                control={control}
                rules={{
                  required: 'Organization ID is required',
                  pattern: {
                    value: /^[a-zA-Z0-9_-]+$/,
                    message:
                      'Organization ID can only contain letters, numbers, hyphens, and underscores',
                  },
                  minLength: {
                    value: 3,
                    message: 'Organization ID must be at least 3 characters',
                  },
                  maxLength: {
                    value: 50,
                    message: 'Organization ID must be less than 50 characters',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Organization ID"
                    error={!!errors.id}
                    helperText={
                      errors.id?.message ||
                      'Unique identifier for your organization (cannot be changed later)'
                    }
                    required
                    fullWidth
                  />
                )}
              />

              <Controller
                name="name"
                control={control}
                rules={{
                  required: 'Organization name is required',
                  maxLength: {
                    value: 100,
                    message:
                      'Organization name must be less than 100 characters',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Organization Name"
                    error={!!errors.name}
                    helperText={
                      errors.name?.message ||
                      'Display name for your organization'
                    }
                    required
                    fullWidth
                  />
                )}
              />

              <Controller
                name="logoUrl"
                control={control}
                rules={{
                  validate: isValidUrl,
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Logo URL"
                    error={!!errors.logoUrl}
                    helperText={
                      errors.logoUrl?.message ||
                      'URL to your organization logo (optional)'
                    }
                    fullWidth
                  />
                )}
              />

              <Controller
                name="homeUrl"
                control={control}
                rules={{
                  validate: isValidUrl,
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Home Page URL"
                    error={!!errors.homeUrl}
                    helperText={
                      errors.homeUrl?.message ||
                      'URL to your organization website (optional)'
                    }
                    fullWidth
                  />
                )}
              />

              <Controller
                name="researchInterests"
                control={control}
                rules={{
                  maxLength: {
                    value: 500,
                    message:
                      'Research interests must be less than 500 characters',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Research Interests"
                    error={!!errors.researchInterests}
                    helperText={
                      errors.researchInterests?.message ||
                      'Brief description of your research focus (optional)'
                    }
                    multiline
                    rows={2}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                rules={{
                  maxLength: {
                    value: 1000,
                    message: 'Description must be less than 1000 characters',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    error={!!errors.description}
                    helperText={
                      errors.description?.message ||
                      'Detailed description of your organization (optional)'
                    }
                    multiline
                    rows={4}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="isPrivate"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Private Organization"
                    sx={{ alignSelf: 'flex-start' }}
                  />
                )}
              />

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: -2 }}
              >
                Private organizations are only visible to members. Public
                organizations can be discovered by anyone.
              </Typography>

              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Organization'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};
