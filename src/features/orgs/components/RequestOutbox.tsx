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
import { faUserPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { GroupRequest, cancelRequest } from '../../../common/api/groupsApi';

interface RequestOutboxProps {
  groupId: string;
  requests: GroupRequest[];
}

export const RequestOutbox: FC<RequestOutboxProps> = ({
  groupId,
  requests,
}) => {
  const [selectedRequest, setSelectedRequest] = useState<GroupRequest | null>(
    null
  );
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const [cancelRequestMutation] = cancelRequest.useMutation();

  const outgoingRequests = requests.filter((req) => req.groupId === groupId);

  const handleCancelRequest = (request: GroupRequest) => {
    setSelectedRequest(request);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedRequest) return;

    try {
      await cancelRequestMutation(selectedRequest.id).unwrap();
      setCancelDialogOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      // TODO: Add proper error handling with toast notification
    }
  };

  const handleCancelDialog = () => {
    setCancelDialogOpen(false);
    setSelectedRequest(null);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (
    status: string
  ): 'warning' | 'success' | 'error' | 'default' => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'denied':
        return 'error';
      case 'expired':
        return 'default';
      default:
        return 'default';
    }
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'invite':
        return 'Invitation';
      case 'request':
        return 'Join Request';
      default:
        return type;
    }
  };

  if (outgoingRequests.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">
          No outgoing invitations or requests for this organization.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Outgoing Invitations & Requests ({outgoingRequests.length})
      </Typography>

      <List>
        {outgoingRequests.map((request, index) => (
          <Card key={request.id} sx={{ mb: 2 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar>
                  <FontAwesomeIcon icon={faUserPlus} />
                </Avatar>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {request.type === 'invite'
                      ? `Invitation to ${request.requester}`
                      : `Request from ${request.requester}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {request.type === 'invite' ? 'Sent' : 'Created'} on{' '}
                    {formatDate(request.createdAt)}
                    {request.expiredAt && (
                      <span> • Expires on {formatDate(request.expiredAt)}</span>
                    )}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip
                      label={getRequestTypeLabel(request.type)}
                      size="small"
                      color="primary"
                    />
                    <Chip
                      label={request.status}
                      size="small"
                      color={getStatusColor(request.status)}
                    />
                  </Stack>
                </Box>

                {request.status === 'pending' && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<FontAwesomeIcon icon={faTimes} />}
                    onClick={() => handleCancelRequest(request)}
                  >
                    Cancel
                  </Button>
                )}
              </Stack>
            </CardContent>
            {index < outgoingRequests.length - 1 && <Divider />}
          </Card>
        ))}
      </List>

      <Dialog open={cancelDialogOpen} onClose={handleCancelDialog}>
        <DialogTitle>Cancel Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this{' '}
            {selectedRequest?.type === 'invite' ? 'invitation' : 'request'}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialog}>Keep Request</Button>
          <Button
            onClick={handleConfirmCancel}
            color="error"
            variant="contained"
          >
            Cancel Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
