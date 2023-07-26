/* NarrativeControlSharing */
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlock } from '@fortawesome/free-solid-svg-icons';
import { FC, useEffect, useId, useState } from 'react';
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
  users,
} from './navigatorSlice';
import { isUserPermission, permissions, UserPermission } from './common';
import classes from './NarrativeControl.module.scss';

export const UserPermissionControl: FC<{
  perm: UserPermission;
  username: string;
  wsId: number;
}> = ({ perm, username, wsId }) => {
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
  const permissionValues: Record<UserPermission, SelectOption> = {
    a: { value: 'a', label: 'can view, edit, and share' },
    n: { value: 'n', label: 'no permissions' },
    r: { value: 'r', label: 'can view' },
    w: { value: 'w', label: 'can view and edit' },
  };
  const permissionOptions = [
    permissionValues.r,
    permissionValues.w,
    permissionValues.a,
  ];
  return (
    <li className={classes.permission}>
      <span>{usersLoaded[username]}</span>
      <div>
        <Select
          options={permissionOptions}
          onChange={async (opts) => {
            const perm = opts[0].value.toString();
            await new Promise<void>((resolve) => {
              setTimeout(() => {
                resolve();
              }, 1000);
            });
            if (isUserPermission(perm)) {
              dispatch(setUserPermission({ permission: perm, username, wsId }));
            }
          }}
          value={permissionValues[perm]}
        />
        <Button onClick={removeShareHandler}>Remove</Button>
      </div>
    </li>
  );
};

const SelectUser: FC<{}> = () => {
  const [userSearch, setUserSearch] = useState('');
  const token = useAppSelector(authToken);
  const searchQuery = token
    ? searchUsers.useQuery({ search: userSearch, token })
    : null;
  const searchResults = searchQuery?.data ? searchQuery.data : [];
  console.log({ searchResults }); // eslint-disable-line no-console
  const userOptions = Object.entries(searchResults).map(
    ([username, realname]) => ({
      value: username,
      label: (
        <>
          {realname} ({username})
        </>
      ),
    })
  );
  return (
    <Select
      options={userOptions}
      onSearch={setUserSearch}
      onChange={(opts) => {
        console.log({ value: opts[0].value }); // eslint-disable-line no-console
      }}
      placeholder={'Share with...'}
    />
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
      <SelectUser />
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
