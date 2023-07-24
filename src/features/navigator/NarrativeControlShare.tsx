/* NarrativeControlSharing */
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlock } from '@fortawesome/free-solid-svg-icons';
import { FC, useEffect, useId } from 'react';
import { authUsername } from '../auth/authSlice';
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
      <Select
        options={[{ id: '1', name: 'one' }].map(({ id, name }) => ({
          value: id,
          label: name,
        }))}
        onChange={(opts) => {
          console.log({ value: opts[0].value }); // eslint-disable-line no-console
        }}
      />
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
