import { useState, useMemo } from 'react';
import {
  getUserProfile,
  setUserProfile,
} from '../../common/api/userProfileApi';
import { Button } from '../../common/components';
import { useAppSelector } from '../../common/hooks';
import { authFromToken, revokeToken } from '../../common/api/authService';
import { faCheck, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { parseError } from '../../common/api/utils/parseError';
import { usePageTitle } from '../layout/layoutSlice';
import { Loader } from '../../common/components/Loader';

export default function Auth() {
  usePageTitle('Authentication');
  const { username, token } = useAppSelector((state) => state.auth);
  return (
    <div>
      <p>
        {token ? `You are logged in as '${username}'` : `You are not logged in`}
      </p>
      {token ? <LogoutForm /> : <AuthForm />}
      <div>
        <UserRealNameChanger />
      </div>
    </div>
  );
}

const AuthForm = () => {
  const [tokenString, setTokenString] = useState<string>();
  const [authFromTokenQuery, authFromTokenResult] =
    authFromToken.useLazyQuery();

  const error = authFromTokenResult.isError
    ? parseError(authFromTokenResult.error).message
    : null;

  const handleLogin = () => {
    if (tokenString) {
      authFromTokenQuery(tokenString);
    } else {
      alert('Please enter a kbase token');
    }
  };

  return (
    <div>
      <input
        placeholder="kbase token"
        type="text"
        value={tokenString ?? ''}
        onChange={(e) => setTokenString(e.target.value)}
      />
      <Button onClick={handleLogin}>Login</Button>
      {error ? (
        <>
          <br />
          <span style={{ color: 'red' }}>{error}</span>
        </>
      ) : null}
    </div>
  );
};

const LogoutForm = () => {
  const tokenId = useAppSelector(({ auth }) => auth.tokenInfo?.id);
  const [revokeTokenMutation, revokeTokenResult] = revokeToken.useMutation();

  const error = revokeTokenResult.isError
    ? parseError(revokeTokenResult.error).message
    : null;

  const handleLogout = () => {
    if (tokenId) revokeTokenMutation(tokenId);
  };

  return (
    <div>
      <Button onClick={handleLogout}>Logout of KBase</Button>
      {error ? (
        <>
          <br />
          <span style={{ color: 'red' }}>{error}</span>
        </>
      ) : null}
    </div>
  );
};

const UserRealNameChanger = () => {
  const username = useAppSelector((s) => s.auth.username);
  const profileParams = useMemo(
    () => ({ usernames: username ? [username] : [] }),
    [username]
  );
  const profile = getUserProfile.useQuery(profileParams, { skip: !username });
  const [updateProfile, updateProfileResult] = setUserProfile.useMutation();
  const [nameText, setNameText] = useState('');

  if (!username) return <></>;

  const changeName = async () => {
    const oldProfile = profile.data?.[0][0];
    const newProfile: typeof oldProfile = JSON.parse(
      JSON.stringify(profile.data?.[0][0])
    );
    if (newProfile === undefined || newProfile === null) return;
    if (nameText.trim() === '') return;
    newProfile.user.realname = nameText.trim();
    updateProfile({ profile: newProfile });
  };

  //example for handling errors
  if (
    profile.error &&
    'status' in profile.error &&
    profile.error.status === 'JSONRPC_ERROR' &&
    // profile.error.data now contains the narrowly typed jsonRpc error response
    profile.error.data.error.message.includes('Something')
  ) {
    // handle jsonrpc errors
  } else {
    // handle other errors
  }

  return (
    <div style={{ maxWidth: '10em' }}>
      Profile:
      {profile.isSuccess ? (
        JSON.stringify(profile.data?.[0][0])
      ) : profile.isError ? (
        JSON.stringify(profile.error)
      ) : (
        <Loader type="spinner" loading={profile.isLoading} />
      )}
      <br />
      <input
        type="text"
        placeholder="Change Realname"
        value={nameText}
        onInput={(e) => setNameText(e.currentTarget.value)}
      />
      <button onClick={() => changeName()}>Update</button>
      <Loader type="spinner" loading={updateProfileResult.isLoading} />
      {updateProfileResult.isSuccess ? <FAIcon icon={faCheck} /> : null}
      {updateProfileResult.isError ? <FAIcon icon={faX} /> : null}
    </div>
  );
};
