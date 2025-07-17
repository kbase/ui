import { FC, useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Alert,
  Typography,
  Box,
  Avatar,
  Chip,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserMinus,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import {
  GroupDetail,
  GroupUser,
  removeMember,
} from '../../../common/api/groupsApi';

interface RemoveMemberDialogProps {
  open: boolean;
  onClose: () => void;
  organization: GroupDetail;
  memberToRemove: GroupUser | null;
  memberRole: 'admin' | 'member';
}

export const RemoveMemberDialog: FC<RemoveMemberDialogProps> = ({
  open,
  onClose,
  organization,
  memberToRemove,
  memberRole,
}) => {
  const [trigger, { isLoading, error, isSuccess }] = removeMember.useMutation();
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle successful removal
  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    }
  }, [isSuccess, onClose]);

  const handleRemove = async () => {
    if (!memberToRemove) return;

    try {
      await trigger({
        groupId: organization.id,
        username: memberToRemove.name,
      }).unwrap();
    } catch (err) {
      // Error is handled by RTK Query and displayed via the error state
    }
  };

  const handleClose = () => {
    if (!isLoading && !showSuccess) {
      onClose();
    }
  };

  if (!memberToRemove) return null;

  const isOwner = memberToRemove.name === organization.owner.name;
  const isLastAdmin =
    memberRole === 'admin' && organization.admins.length === 1;

  // Prevent removal of owner or last admin
  if (isOwner) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <FontAwesomeIcon icon={faExclamationTriangle} color="orange" />
            Cannot Remove Owner
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            The organization owner cannot be removed. To remove this user, you
            must first transfer ownership to another admin.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <FontAwesomeIcon icon={faUserMinus} />
          Remove Member
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {showSuccess && (
            <Alert severity="success">
              {memberToRemove.name} has been successfully removed from the
              organization.
            </Alert>
          )}

          {error && (
            <Alert severity="error">
              Failed to remove member. Please try again.
            </Alert>
          )}

          {!showSuccess && (
            <>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar>{memberToRemove.name.charAt(0).toUpperCase()}</Avatar>
                <Box>
                  <Typography variant="h6">{memberToRemove.name}</Typography>
                  <Chip
                    label={memberRole}
                    size="small"
                    color={memberRole === 'admin' ? 'primary' : 'default'}
                  />
                </Box>
              </Box>

              <Alert severity="warning">
                Are you sure you want to remove{' '}
                <strong>{memberToRemove.name}</strong> from{' '}
                <strong>{organization.name}</strong>?
              </Alert>

              <Typography variant="body2" color="text.secondary">
                <strong>This action will:</strong>
              </Typography>
              <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                <li>
                  Remove {memberToRemove.name} from the organization immediately
                </li>
                <li>Revoke their access to all organization resources</li>
                <li>
                  Remove them from organization discussions and notifications
                </li>
                {memberRole === 'admin' && (
                  <li>
                    Remove their admin privileges and management permissions
                  </li>
                )}
              </Box>

              {isLastAdmin && (
                <Alert severity="error">
                  <strong>Warning:</strong> This is the last admin in the
                  organization. Removing them will leave no administrators to
                  manage the organization. Consider promoting another member to
                  admin first.
                </Alert>
              )}

              <Typography variant="body2" color="text.secondary">
                <strong>Note:</strong> The user can request to rejoin the
                organization later, but they will need to be re-approved.
              </Typography>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          {showSuccess ? 'Close' : 'Cancel'}
        </Button>
        {!showSuccess && (
          <Button
            onClick={handleRemove}
            variant="contained"
            color="error"
            disabled={isLoading || isLastAdmin}
            startIcon={<FontAwesomeIcon icon={faUserMinus} />}
          >
            {isLoading ? 'Removing...' : 'Remove Member'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
