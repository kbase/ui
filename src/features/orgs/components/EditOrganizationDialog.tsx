import { FC, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Stack,
  Box,
  Alert,
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import {
  GroupDetail,
  UpdateGroupInput,
  updateGroup,
} from '../../../common/api/groupsApi';

interface EditOrganizationDialogProps {
  open: boolean;
  onClose: () => void;
  organization: GroupDetail;
}

export const EditOrganizationDialog: FC<EditOrganizationDialogProps> = ({
  open,
  onClose,
  organization,
}) => {
  const [trigger, { isLoading, error, isSuccess }] = updateGroup.useMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateGroupInput>({
    mode: 'onBlur',
  });

  // Reset form when organization changes or dialog opens
  useEffect(() => {
    if (open && organization) {
      reset({
        name: organization.name,
        logoUrl: organization.custom?.logourl || '',
        homeUrl: organization.custom?.homeurl || '',
        researchInterests: organization.custom?.researchinterests || '',
        description: organization.custom?.description || '',
        isPrivate: organization.private,
      });
    }
  }, [open, organization, reset]);

  // Close dialog on successful update
  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess, onClose]);

  const isValidUrl = (value: string | undefined): boolean | string => {
    if (!value) return true; // Allow empty values for optional fields
    try {
      new URL(value);
      return true;
    } catch (_) {
      return 'Please enter a valid URL';
    }
  };

  const onSubmit = async (data: UpdateGroupInput) => {
    try {
      await trigger({ id: organization.id, update: data }).unwrap();
    } catch (err) {
      // Error is handled by RTK Query and displayed via the error state
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Organization</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error">
              Failed to update organization. Please try again.
            </Alert>
          )}

          <Controller
            name="name"
            control={control}
            rules={{
              required: 'Organization name is required',
              maxLength: {
                value: 100,
                message: 'Organization name must be less than 100 characters',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Organization Name"
                error={!!errors.name}
                helperText={
                  errors.name?.message || 'Display name for your organization'
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
                message: 'Research interests must be less than 500 characters',
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

          <Box>
            <Controller
              name="isPrivate"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label="Private Organization"
                />
              )}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Private organizations are only visible to members. Public
              organizations can be discovered by anyone.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isLoading || !isDirty}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
