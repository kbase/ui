import { FC, useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Alert,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { GroupDetail, inviteUser } from '../../../common/api/groupsApi';

interface InviteMemberDialogProps {
  open: boolean;
  onClose: () => void;
  organization: GroupDetail;
}

interface InviteFormData {
  username: string;
  role: 'member' | 'admin';
  message?: string;
}

export const InviteMemberDialog: FC<InviteMemberDialogProps> = ({
  open,
  onClose,
  organization,
}) => {
  const [trigger, { isLoading, error, isSuccess }] = inviteUser.useMutation();
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<InviteFormData>({
    defaultValues: {
      username: '',
      role: 'member',
      message: '',
    },
    mode: 'onBlur',
  });

  const username = watch('username');

  // Handle successful invitation
  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      reset();
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    }
  }, [isSuccess, reset, onClose]);

  const validateUsername = (value: string): boolean | string => {
    if (!value.trim()) return 'Username is required';

    // Check if user is already a member
    const allMembers = [
      organization.owner.name,
      ...organization.admins.map((admin) => admin.name),
      ...organization.members.map((member) => member.name),
    ];

    if (allMembers.includes(value.trim())) {
      return 'This user is already a member of the organization';
    }

    // Basic username validation (alphanumeric, underscore, hyphen)
    if (!/^[a-zA-Z0-9_-]+$/.test(value.trim())) {
      return 'Username can only contain letters, numbers, underscores, and hyphens';
    }

    return true;
  };

  const onSubmit = async (data: InviteFormData) => {
    try {
      await trigger({
        groupId: organization.id,
        username: data.username.trim(),
      }).unwrap();
    } catch (err) {
      // Error is handled by RTK Query and displayed via the error state
    }
  };

  const handleClose = () => {
    if (!isLoading && !showSuccess) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <FontAwesomeIcon icon={faUserPlus} />
          Invite User to {organization.name}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {showSuccess && (
            <Alert severity="success">
              Invitation sent successfully! The user will receive a notification
              and can accept the invitation to join the organization.
            </Alert>
          )}

          {error && (
            <Alert severity="error">
              Failed to send invitation. Please check the username and try
              again.
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary">
            Invite a KBase user to join this organization. They will receive a
            notification and can choose to accept or decline the invitation.
          </Typography>

          <Controller
            name="username"
            control={control}
            rules={{
              validate: validateUsername,
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="KBase Username"
                error={!!errors.username}
                helperText={
                  errors.username?.message ||
                  'Enter the exact KBase username of the person to invite'
                }
                required
                fullWidth
                autoFocus
                disabled={isLoading || showSuccess}
              />
            )}
          />

          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth disabled={isLoading || showSuccess}>
                <InputLabel>Initial Role</InputLabel>
                <Select {...field} label="Initial Role">
                  <MenuItem value="member">Member</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            )}
          />

          <Typography variant="caption" color="text.secondary">
            <strong>Member:</strong> Can view organization content and
            participate in discussions.
            <br />
            <strong>Admin:</strong> Can manage members, approve requests, and
            edit organization settings.
            <br />
            Note: Role can be changed after the invitation is accepted.
          </Typography>

          <Controller
            name="message"
            control={control}
            rules={{
              maxLength: {
                value: 500,
                message: 'Message must be less than 500 characters',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Personal Message (Optional)"
                error={!!errors.message}
                helperText={
                  errors.message?.message ||
                  'Add a personal note to the invitation (optional)'
                }
                multiline
                rows={3}
                fullWidth
                disabled={isLoading || showSuccess}
                placeholder="Hi! I'd like to invite you to join our organization..."
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading || showSuccess}>
          {showSuccess ? 'Close' : 'Cancel'}
        </Button>
        {!showSuccess && (
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={isLoading || !username.trim()}
            startIcon={<FontAwesomeIcon icon={faUserPlus} />}
          >
            {isLoading ? 'Sending Invitation...' : 'Send Invitation'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
