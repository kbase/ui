import { FC, useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEllipsisV,
  faUserPlus,
  faUserMinus,
  faUserShield,
  faUserCheck,
} from '@fortawesome/free-solid-svg-icons';
import {
  GroupDetail,
  GroupUser,
  memberToAdmin,
  adminToMember,
} from '../../../common/api/groupsApi';
import { InviteMemberDialog } from './InviteMemberDialog';
import { RemoveMemberDialog } from './RemoveMemberDialog';

interface MemberManagementActionsProps {
  organization: GroupDetail;
  currentUserRole: string;
  targetMember?: GroupUser;
  targetMemberRole?: 'owner' | 'admin' | 'member';
  showInviteOnly?: boolean;
}

export const MemberManagementActions: FC<MemberManagementActionsProps> = ({
  organization,
  currentUserRole,
  targetMember,
  targetMemberRole,
  showInviteOnly = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  const [promoteToAdmin] = memberToAdmin.useMutation();
  const [demoteToMember] = adminToMember.useMutation();

  const open = Boolean(anchorEl);
  const canManageMembers = ['Admin', 'Owner'].includes(currentUserRole);
  const isOwner = currentUserRole === 'Owner';
  const isTargetOwner = targetMemberRole === 'owner';

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleInviteUser = () => {
    setInviteDialogOpen(true);
    handleClose();
  };

  const handleRemoveMember = () => {
    setRemoveDialogOpen(true);
    handleClose();
  };

  const handlePromoteToAdmin = async () => {
    if (!targetMember) return;
    try {
      await promoteToAdmin({
        groupId: organization.id,
        username: targetMember.name,
      }).unwrap();
    } catch (err) {
      // Error handling could be improved with toast notifications
    }
    handleClose();
  };

  const handleDemoteToMember = async () => {
    if (!targetMember) return;
    try {
      await demoteToMember({
        groupId: organization.id,
        username: targetMember.name,
      }).unwrap();
    } catch (err) {
      // Error handling could be improved with toast notifications
    }
    handleClose();
  };

  if (!canManageMembers) return null;

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        aria-label="member management actions"
      >
        <FontAwesomeIcon icon={faEllipsisV} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleInviteUser}>
          <ListItemIcon>
            <FontAwesomeIcon icon={faUserPlus} fontSize="small" />
          </ListItemIcon>
          <ListItemText>Invite User</ListItemText>
        </MenuItem>

        {!showInviteOnly && targetMember && (
          <>
            <Divider />

            {/* Role management options */}
            {targetMemberRole === 'member' && isOwner && (
              <MenuItem onClick={handlePromoteToAdmin}>
                <ListItemIcon>
                  <FontAwesomeIcon icon={faUserShield} fontSize="small" />
                </ListItemIcon>
                <ListItemText>Promote to Admin</ListItemText>
              </MenuItem>
            )}

            {targetMemberRole === 'admin' && isOwner && (
              <MenuItem onClick={handleDemoteToMember}>
                <ListItemIcon>
                  <FontAwesomeIcon icon={faUserCheck} fontSize="small" />
                </ListItemIcon>
                <ListItemText>Demote to Member</ListItemText>
              </MenuItem>
            )}

            {/* Remove member option */}
            {!isTargetOwner && (
              <MenuItem
                onClick={handleRemoveMember}
                sx={{ color: 'error.main' }}
              >
                <ListItemIcon>
                  <FontAwesomeIcon icon={faUserMinus} fontSize="small" />
                </ListItemIcon>
                <ListItemText>Remove Member</ListItemText>
              </MenuItem>
            )}
          </>
        )}
      </Menu>

      <InviteMemberDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        organization={organization}
      />

      {targetMember && (
        <RemoveMemberDialog
          open={removeDialogOpen}
          onClose={() => setRemoveDialogOpen(false)}
          organization={organization}
          memberToRemove={targetMember}
          memberRole={targetMemberRole === 'admin' ? 'admin' : 'member'}
        />
      )}
    </>
  );
};
