/* NarrativeControl/Share */
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlock } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { FC, ReactElement, useEffect, useId, useMemo, useState } from 'react';
import { authToken, authUsername } from '../../auth/authSlice';
import { searchUsers } from '../../../common/api/authService';
import { isKBaseBaseQueryError } from '../../../common/api/utils/common';
import { parseError } from '../../../common/api/utils/parseError';
import {
  getwsPermissions,
  setwsGlobalPermissions,
  setwsUsersPermissions,
} from '../../../common/api/workspaceApi';
import { Button, Select, SelectOption } from '../../../common/components';
import { useAppDispatch, useAppSelector } from '../../../common/hooks';
import { NarrativeDoc } from '../../../common/types/NarrativeDoc';
import {
  removeShare,
  setLoading,
  setShares,
  setUserPermission,
  shares,
  synchronized,
  updateUsers,
  users,
} from '../navigatorSlice';
import { isUserPermission, permissions, UserPermission } from '../common';
import { ErrorMessage } from './common';
import classes from './NarrativeControl.module.scss';

const permissionValues: Record<UserPermission, SelectOption> = {
  a: { value: 'a', label: 'can view, edit, and share' },
  n: { value: 'n', label: 'no permissions' },
  r: { value: 'r', label: 'can view' },
  w: { value: 'w', label: 'can view and edit' },
};

const UserPermissionSelection: FC<{
  initialPerm?: UserPermission;
  onChange: (opts: SelectOption[]) => void;
  username: string;
  wsId: number;
}> = ({ initialPerm, onChange, username, wsId }) => {
  /* hooks */
  const syncd = useAppSelector(synchronized);

  /* derived values */
  const permissionOptions = [
    permissionValues.r,
    permissionValues.w,
    permissionValues.a,
  ];

  /* <UserPermissionSelection /> component */
  return (
    <Select
      disabled={!syncd}
      options={permissionOptions}
      onChange={onChange}
      value={permissionValues[initialPerm || 'r']}
    />
  );
};

export const UserPermissionControl: FC<{
  modalClose: () => void;
  perm: UserPermission;
  username: string;
  wsId: number;
}> = (props) => {
  /* hooks */
  const dispatch = useAppDispatch();
  const usersLoaded = useAppSelector(users);
  const [updateUserPermissionTrigger] = setwsUsersPermissions.useMutation();

  /* derived values */
  const { modalClose, perm, username, wsId } = props;

  /* remove permission callback */
  const removeShareHandler = async () => {
    modalClose();
    dispatch(removeShare({ username, wsId }));
    const message = `Remove permissions for ${username} from ${wsId}.`;
    try {
      await updateUserPermissionTrigger({
        permission: 'n',
        users: [username],
        wsId,
      }).unwrap();
      dispatch(setLoading(false));
    } catch (err) {
      if (!isKBaseBaseQueryError(err)) {
        console.error({ err }); // eslint-disable-line no-console
        toast(ErrorMessage({ err }));
        return;
      }
      toast(ErrorMessage({ err: parseError(err) }));
      dispatch(setLoading(false));
      return;
    }
    toast(message);
  };

  /* set permission callback */
  const setPermission = async (opts: SelectOption[]) => {
    const perm = opts[0].value.toString();
    if (!isUserPermission(perm)) {
      return;
    }
    const message = `Set ${username} permission on ${wsId} to ${perm}.`;
    modalClose();
    dispatch(setUserPermission({ permission: perm, username, wsId }));
    try {
      await updateUserPermissionTrigger({
        permission: perm,
        users: [username],
        wsId,
      }).unwrap();
      dispatch(setLoading(false));
    } catch (err) {
      if (!isKBaseBaseQueryError(err)) {
        console.error({ err }); // eslint-disable-line no-console
        toast(ErrorMessage({ err }));
        return;
      }
      toast(ErrorMessage({ err: parseError(err) }));
      dispatch(setLoading(false));
      return;
    }
    toast(message);
  };
  return (
    <li className={classes.permission}>
      <span>
        {usersLoaded[username]} ({username})
      </span>
      <div>
        <UserPermissionSelection
          initialPerm={perm}
          onChange={setPermission}
          {...props}
        />
        <Button onClick={removeShareHandler}>Remove</Button>
      </div>
    </li>
  );
};

const emptyOptions: { value: string; label: ReactElement }[] = [];
const emptySearchResults: Record<string, string> = {};
const emptyUsernamesIgnored: string[] = [];
const filterUsernames = ({
  results,
  usernames,
}: {
  results: Record<string, string>;
  usernames?: string[];
}) => {
  const usernamesIgnored = new Set(usernames);
  return Object.entries(results).filter(
    ([username]) => !usernamesIgnored.has(username) && username !== '*'
  );
};

const SelectUser: FC<{
  modalClose: () => void;
  wsId: number;
}> = ({ modalClose, wsId }) => {
  /* hooks */
  const dispatch = useAppDispatch();
  const syncd = useAppSelector(synchronized);
  const token = useAppSelector(authToken);
  const usernameAuthed = useAppSelector(authUsername);
  const usernamesShares = useAppSelector(shares);
  const [userOptions, setUserOptions] = useState(emptyOptions);
  const [usernamesIgnored, setUsernamesIgnored] = useState(
    emptyUsernamesIgnored
  );
  const [userSearch, setUserSearch] = useState('');
  const [userSelected, setUserSelected] = useState('');
  const [permSelected, setPermSelected] = useState('r');
  const [searchResults, setSearchResults] = useState(emptySearchResults);
  const searchQuery = token
    ? searchUsers.useQuery({ search: userSearch, token })
    : null;
  useMemo(() => {
    const usernamesShared = Object.keys(usernamesShares);
    const usernames = usernameAuthed
      ? [usernameAuthed, ...usernamesShared]
      : [];
    setUsernamesIgnored(usernames);
    if (searchQuery?.data) {
      setSearchResults(
        Object.fromEntries(
          filterUsernames({
            usernames,
            results: searchQuery.data,
          })
        )
      );
    }
  }, [searchQuery?.data, usernameAuthed, usernamesShares]);
  useEffect(() => {
    const usersOther = filterUsernames({
      results: searchResults,
      usernames: usernamesIgnored,
    });
    const usersOtherObj = Object.fromEntries(usersOther);
    dispatch(updateUsers(usersOtherObj));
    setUserOptions(
      usersOther.map(([username, realname]) => ({
        value: username,
        label: (
          <>
            {realname} ({username})
          </>
        ),
      }))
    );
  }, [dispatch, searchResults, usernamesIgnored]);
  const [addUserPermissionTrigger] = setwsUsersPermissions.useMutation();

  /* derived values */
  const permSelection: UserPermission = isUserPermission(permSelected)
    ? permSelected
    : 'n';

  /* set permission level callback */
  const onChange = (opts: SelectOption[]) => {
    const perm = opts[0].value.toString();
    if (isUserPermission(perm)) {
      setPermSelected(perm);
    }
  };

  /* add permission callback */
  const addShareHandlerFactory =
    ({ perm, username }: { perm: UserPermission; username: string }) =>
    async () => {
      if (!username) return;
      const message = `Add ${username} to ${wsId} with permissions '${perm}'.`;
      modalClose();
      dispatch(setUserPermission({ permission: perm, username, wsId }));
      setUserSearch('');
      setUserSelected('');
      setSearchResults(emptySearchResults);
      try {
        await addUserPermissionTrigger({
          permission: perm,
          users: [username],
          wsId,
        }).unwrap();
        dispatch(setLoading(false));
      } catch (err) {
        if (!isKBaseBaseQueryError(err)) {
          console.error({ err }); // eslint-disable-line no-console
          toast(ErrorMessage({ err }));
          return;
        }
        toast(ErrorMessage({ err: parseError(err) }));
        dispatch(setLoading(false));
        return;
      }
      toast(message);
    };
  return (
    <>
      <Select
        className={classes['select-user']}
        options={userOptions}
        onSearch={setUserSearch}
        onChange={(opts) => {
          const username = opts[0].value.toString();
          setUserSelected(username);
        }}
        placeholder={'Share with...'}
        value={userOptions.filter((opt) => opt.value === userSelected)}
      />
      <UserPermissionSelection
        initialPerm={permSelection}
        onChange={onChange}
        username={userSelected}
        wsId={wsId}
      />
      <Button
        disabled={!userSelected || !syncd}
        onClick={addShareHandlerFactory({
          username: userSelected,
          perm: permSelection,
        })}
      >
        Apply
      </Button>
    </>
  );
};

const PublicToggle: FC<{
  narrativeIsPublic: boolean;
  togglePublic: () => Promise<void>;
  userIsAdmin: boolean;
}> = ({ narrativeIsPublic, togglePublic, userIsAdmin }) => {
  const syncd = useAppSelector(synchronized);
  return (
    <Button disabled={!syncd} onClick={togglePublic}>
      {narrativeIsPublic ? (
        <>
          <FAIcon icon={faUnlock} />
          public
        </>
      ) : (
        <>
          <FAIcon icon={faLock} />
          private
        </>
      )}
      ({userIsAdmin ? `click to ${narrativeIsPublic ? 'lock' : 'unlock'}` : ''})
    </Button>
  );
};

export const Share: FC<{
  narrativeDoc: NarrativeDoc;
  modalClose: () => void;
}> = ({ narrativeDoc, modalClose }) => {
  /* hooks */
  const dispatch = useAppDispatch();
  const usernameShares = useAppSelector(shares);
  const usernameAuthed = useAppSelector(authUsername);
  const wsId = narrativeDoc.access_group;
  const wsPermsQuery = getwsPermissions.useQuery({ wsId });
  const shareSelectId = useId();
  const [toggleTrigger] = setwsGlobalPermissions.useMutation();
  useEffect(() => {
    if (wsPermsQuery.isSuccess) {
      const data = wsPermsQuery.currentData;
      const usersPermissions = (data && data[0].perms[0]) || {};
      if (usersPermissions) {
        dispatch(setShares(usersPermissions));
      }
    }
  }, [dispatch, wsPermsQuery.currentData, wsPermsQuery.isSuccess]);

  /* derived values */
  const narrativeIsPublic = usernameShares['*'] === 'r';
  const userPermission: UserPermission =
    (usernameAuthed && usernameShares[usernameAuthed]) || 'n';
  const userIsAdmin = Boolean(usernameAuthed) && userPermission === 'a';
  const usernames = usernameAuthed ? [usernameAuthed] : [];
  const usernamePermissions = filterUsernames({
    usernames,
    results: usernameShares,
  });

  /* add permission callback */
  // See <SelectUser /> component

  /* set permission callback */
  // See <UserPermissionControl /> component

  /* remove permission callback */
  // See <UserPermissionControl /> component

  /* toggle public callback */
  // Workspace.set_global_permission
  const togglePublic = async () => {
    const nextStatus = narrativeIsPublic ? 'private' : 'public';
    const nextPermission = narrativeIsPublic ? 'n' : 'r';
    const message = `Set narrative ${wsId} to ${nextStatus}.`;
    modalClose();
    if (narrativeIsPublic) {
      dispatch(removeShare({ wsId, username: '*' }));
    } else {
      dispatch(setUserPermission({ wsId, permission: 'r', username: '*' }));
    }
    try {
      await toggleTrigger({ wsId, permission: nextPermission }).unwrap();
      dispatch(setLoading(false));
    } catch (err) {
      if (!isKBaseBaseQueryError(err)) {
        console.error({ err }); // eslint-disable-line no-console
        toast(ErrorMessage({ err }));
        return;
      }
      toast(ErrorMessage({ err: parseError(err) }));
      dispatch(setLoading(false));
      return;
    }
    toast(message);
  };

  return (
    <>
      <label htmlFor={shareSelectId}>
        Manage Sharing for {narrativeDoc.access_group}.
      </label>
      <PublicToggle
        narrativeIsPublic={narrativeIsPublic}
        togglePublic={togglePublic}
        userIsAdmin={userIsAdmin}
      />
      <p>{permissions[userPermission]}</p>
      <SelectUser modalClose={modalClose} wsId={wsId} />
      <ul>
        {usernamePermissions.map(([username, permission]) => {
          if (!isUserPermission(permission)) return <></>;
          return (
            <UserPermissionControl
              key={username}
              modalClose={modalClose}
              perm={permission}
              username={username}
              wsId={wsId}
            />
          );
        })}
      </ul>
      <Button onClick={modalClose}>Cancel</Button>
    </>
  );
};
