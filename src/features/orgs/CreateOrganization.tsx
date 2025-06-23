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
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../layout/layoutSlice';
import {
  useCreateOrganizationMutation,
  CreateOrganizationInput,
} from '../../common/api/orgsApi';

export const CreateOrganization: FC = () => {
  usePageTitle('Create Organization');
  const navigate = useNavigate();
  const [createOrganization, { isLoading, error }] =
    useCreateOrganizationMutation();

  const [formData, setFormData] = useState<CreateOrganizationInput>({
    id: '',
    name: '',
    logoUrl: '',
    homeUrl: '',
    researchInterests: '',
    description: '',
    isPrivate: false,
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const handleChange =
    (field: keyof CreateOrganizationInput) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === 'isPrivate' ? event.target.checked : event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear validation error when user starts typing
      if (validationErrors[field]) {
        setValidationErrors((prev) => ({ ...prev, [field]: '' }));
      }
    };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.id.trim()) {
      errors.id = 'Organization ID is required';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.id)) {
      errors.id =
        'Organization ID can only contain letters, numbers, hyphens, and underscores';
    } else if (formData.id.length < 3) {
      errors.id = 'Organization ID must be at least 3 characters';
    } else if (formData.id.length > 50) {
      errors.id = 'Organization ID must be less than 50 characters';
    }

    if (!formData.name.trim()) {
      errors.name = 'Organization name is required';
    } else if (formData.name.length > 100) {
      errors.name = 'Organization name must be less than 100 characters';
    }

    if (formData.logoUrl && !isValidUrl(formData.logoUrl)) {
      errors.logoUrl = 'Please enter a valid URL';
    }

    if (formData.homeUrl && !isValidUrl(formData.homeUrl)) {
      errors.homeUrl = 'Please enter a valid URL';
    }

    if (formData.description && formData.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }

    if (formData.researchInterests && formData.researchInterests.length > 500) {
      errors.researchInterests =
        'Research interests must be less than 500 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await createOrganization(formData).unwrap();
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

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Organization ID"
                value={formData.id}
                onChange={handleChange('id')}
                error={!!validationErrors.id}
                helperText={
                  validationErrors.id ||
                  'Unique identifier for your organization (cannot be changed later)'
                }
                required
                fullWidth
              />

              <TextField
                label="Organization Name"
                value={formData.name}
                onChange={handleChange('name')}
                error={!!validationErrors.name}
                helperText={
                  validationErrors.name || 'Display name for your organization'
                }
                required
                fullWidth
              />

              <TextField
                label="Logo URL"
                value={formData.logoUrl}
                onChange={handleChange('logoUrl')}
                error={!!validationErrors.logoUrl}
                helperText={
                  validationErrors.logoUrl ||
                  'URL to your organization logo (optional)'
                }
                fullWidth
              />

              <TextField
                label="Home Page URL"
                value={formData.homeUrl}
                onChange={handleChange('homeUrl')}
                error={!!validationErrors.homeUrl}
                helperText={
                  validationErrors.homeUrl ||
                  'URL to your organization website (optional)'
                }
                fullWidth
              />

              <TextField
                label="Research Interests"
                value={formData.researchInterests}
                onChange={handleChange('researchInterests')}
                error={!!validationErrors.researchInterests}
                helperText={
                  validationErrors.researchInterests ||
                  'Brief description of your research focus (optional)'
                }
                multiline
                rows={2}
                fullWidth
              />

              <TextField
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                error={!!validationErrors.description}
                helperText={
                  validationErrors.description ||
                  'Detailed description of your organization (optional)'
                }
                multiline
                rows={4}
                fullWidth
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isPrivate}
                    onChange={handleChange('isPrivate')}
                  />
                }
                label="Private Organization"
                sx={{ alignSelf: 'flex-start' }}
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
