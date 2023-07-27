/* NarrativeControlSharing */
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlock } from '@fortawesome/free-solid-svg-icons';
import { FC, ReactElement, useEffect, useId, useMemo, useState } from 'react';
import { authToken, authUsername } from '../auth/authSlice';
import { searchUsers } from '../../common/api/authService';
import { getwsPermissions } from '../../common/api/workspaceApi';
import { Button, Select, SelectOption } from '../../common/components';
import { useAppDispatch, useAppSelector } from '../../common/hooks';
import { NarrativeDoc } from '../../common/types/NarrativeDoc';
import {
  removeShare,
  setShares,
  setUserPermission,
  shares,
  updateUsers,
  users,
} from './navigatorSlice';
import { isUserPermission, permissions, UserPermission } from './common';
import classes from './NarrativeControl.module.scss';

const permissionValues: Record<UserPermission, SelectOption> = {
  a: { value: 'a', label: 'can view, edit, and share' },
  n: { value: 'n', label: 'no permissions' },
  r: { value: 'r', label: 'can view' },
  w: { value: 'w', label: 'can view and edit' },
};

const UserPermissionSelection: FC<{
  initialPerm?: UserPermission;
  onChange: (opts: SelectOption[]) => Promise<void> | void;
  username: string;
  wsId: number;
}> = ({ initialPerm, onChange, username, wsId }) => {
  const permissionOptions = [
    permissionValues.r,
    permissionValues.w,
    permissionValues.a,
  ];
  return (
    <Select
      options={permissionOptions}
      onChange={onChange}
      value={permissionValues[initialPerm || 'r']}
    />
  );
};

export const UserPermissionControl: FC<{
  perm: UserPermission;
  username: string;
  wsId: number;
}> = (props) => {
  const { perm, username, wsId } = props;
  const usersLoaded = useAppSelector(users);
  const dispatch = useAppDispatch();
  const removeShareHandler = async () => {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
    dispatch(removeShare({ username, wsId }));
  };
  const onChange = async (opts: SelectOption[]) => {
    const perm = opts[0].value.toString();
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
    if (isUserPermission(perm)) {
      dispatch(setUserPermission({ permission: perm, username, wsId }));
    }
  };
  return (
    <li className={classes.permission}>
      <span>
        {usersLoaded[username]} ({username})
      </span>
      <div>
        <UserPermissionSelection
          initialPerm={perm}
          onChange={onChange}
          {...props}
        />
        <Button onClick={removeShareHandler}>Remove</Button>
      </div>
    </li>
  );
};

const emptyOptions: { value: string; label: ReactElement }[] = [];
// const emptySearchResults: Record<string, string> = {};

const SelectUser: FC<{ wsId: number }> = ({ wsId }) => {
  const dispatch = useAppDispatch();
  const token = useAppSelector(authToken);
  const [userOptions, setUserOptions] = useState(emptyOptions);
  const [userSearch, setUserSearch] = useState('');
  const [userSelected, setUserSelected] = useState('');
  const [permSelected, setPermSelected] = useState('r');
  const [searchResults, setSearchResults] = useState({});
  const searchQuery = token
    ? searchUsers.useQuery({ search: userSearch, token })
    : null;
  useMemo(() => {
    if (searchQuery?.data) {
      setSearchResults(searchQuery.data);
    }
  }, [searchQuery?.data]);
  useEffect(() => {
    dispatch(updateUsers(searchResults));
    setUserOptions(
      Object.entries(searchResults).map(([username, realname]) => ({
        value: username,
        label: (
          <>
            {realname} ({username})
          </>
        ),
      }))
    );
  }, [dispatch, searchResults]);
  const addShareHandlerFactory =
    ({ perm, username }: { perm: UserPermission; username: string }) =>
    async () => {
      if (!username) return;
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });
      dispatch(setUserPermission({ permission: perm, username, wsId }));
      setUserSearch('');
      setUserSelected('');
      setSearchResults({});
    };
  const permSelection: UserPermission = isUserPermission(permSelected)
    ? permSelected
    : 'n';
  const onChange = (opts: SelectOption[]) => {
    const perm = opts[0].value.toString();
    if (isUserPermission(perm)) {
      setPermSelected(perm);
    }
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
        disabled={!userSelected}
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

export const Share: FC<{
  narrativeDoc: NarrativeDoc;
  modalClose: () => void;
}> = ({ narrativeDoc, modalClose }) => {
  const dispatch = useAppDispatch();
  const userShares = useAppSelector(shares);
  const username = useAppSelector(authUsername);
  const wsId = narrativeDoc.access_group;
  const wsPermsQuery = getwsPermissions.useQuery({ wsId });
  useEffect(() => {
    if (wsPermsQuery.isSuccess) {
      const data = wsPermsQuery.currentData;
      const usersPermissions = (data && data[0].perms[0]) || {};
      if (usersPermissions) {
        dispatch(setShares(usersPermissions));
      }
    }
  }, [dispatch, wsPermsQuery.currentData, wsPermsQuery.isSuccess]);
  const shareSelectId = useId();
  const narrativeIsPublic = userShares['*'] === 'r';
  const userPermission: UserPermission =
    (username && userShares[username]) || 'n';
  const userIsAdmin = username && userPermission === 'a';
  return (
    <>
      <label htmlFor={shareSelectId}>
        Manage Sharing for {narrativeDoc.access_group}.
      </label>
      <p>
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
        (
        {userIsAdmin ? `click to ${narrativeIsPublic ? 'lock' : 'unlock'}` : ''}
        )
      </p>
      <p>{permissions[userPermission]}</p>
      <SelectUser wsId={wsId} />
      <ul>
        {Object.entries(userShares).map(([user, perm]) => (
          <UserPermissionControl
            key={user}
            perm={perm}
            username={user}
            wsId={wsId}
          />
        ))}
      </ul>
      <Button onClick={modalClose}>Cancel</Button>
    </>
  );
};
