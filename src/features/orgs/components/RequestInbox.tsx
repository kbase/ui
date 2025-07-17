import { FC, useState } from 'react';
import {
  Box,
  Typography,
  List,
  Avatar,
  Button,
  Card,
  CardContent,
  Stack,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Divider,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import {
  GroupRequest,
  acceptRequest,
  denyRequest,
} from '../../../common/api/groupsApi';

interface RequestInboxProps {
  groupId: string;
  requests: GroupRequest[];
}

export const RequestInbox: FC<RequestInboxProps> = ({ groupId, requests }) => {
  const [selectedRequest, setSelectedRequest] = useState<GroupRequest | null>(
    null
  );
  const [actionType, setActionType] = useState<'approve' | 'deny' | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [approveRequestMutation] = acceptRequest.useMutation();
  const [denyRequestMutation] = denyRequest.useMutation();

  const pendingRequests = requests.filter((req) => req.status === 'pending');

  const handleAction = (request: GroupRequest, action: 'approve' | 'deny') => {
    setSelectedRequest(request);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      if (actionType === 'approve') {
        await approveRequestMutation(selectedRequest.id).unwrap();
      } else {
        await denyRequestMutation(selectedRequest.id).unwrap();
      }
      setDialogOpen(false);
      setSelectedRequest(null);
      setActionType(null);
    } catch (error) {
      // TODO: Add proper error handling with toast notification
    }
  };

  const handleCancelAction = () => {
    setDialogOpen(false);
    setSelectedRequest(null);
    setActionType(null);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  if (pendingRequests.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">
          No pending membership requests for this organization.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Pending Membership Requests ({pendingRequests.length})
      </Typography>

      <List>
        {pendingRequests.map((request, index) => (
          <Card key={request.id} sx={{ mb: 2 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar>
                  <FontAwesomeIcon icon={faUserPlus} />
                </Avatar>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {request.requester}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Requested membership on {formatDate(request.createdAt)}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip label={request.type} size="small" color="primary" />
                    <Chip label={request.status} size="small" color="warning" />
                  </Stack>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => handleAction(request, 'approve')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleAction(request, 'deny')}
                  >
                    Deny
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
            {index < pendingRequests.length - 1 && <Divider />}
          </Card>
        ))}
      </List>

      <Dialog open={dialogOpen} onClose={handleCancelAction}>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Request' : 'Deny Request'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {actionType} the membership request from{' '}
            <strong>{selectedRequest?.requester}</strong>?
            {actionType === 'approve' &&
              ' This will grant them member access to the organization.'}
            {actionType === 'deny' &&
              ' This action cannot be undone and the user will need to request membership again.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAction}>Cancel</Button>
          <Button
            onClick={handleConfirmAction}
            color={actionType === 'approve' ? 'success' : 'error'}
            variant="contained"
          >
            {actionType === 'approve' ? 'Approve Request' : 'Deny Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
