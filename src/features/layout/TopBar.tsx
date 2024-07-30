import {
  faFlask,
  faIdCard,
  faQuestionCircle,
  faSignOutAlt,
  faSortDown,
  faUser,
  faWrench,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { Button, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { FC, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { resetStateAction } from '../../app/store';
import { revokeToken } from '../../common/api/authService';
import { getUserProfile } from '../../common/api/userProfileApi';
import logo from '../../common/assets/logo/rectangle_short.png';
import { useAppDispatch, useAppSelector } from '../../common/hooks';
import { authUsername, setAuth } from '../auth/authSlice';
import { noOp } from '../common';
import classes from './TopBar.module.scss';

export default function TopBar() {
  const username = useAppSelector(authUsername);

  return (
    <header className={classes.topbar}>
      <div className={classes.topbar_item}>
        {/* TODO: replace with recntagular logo without tagline */}
        <img src={logo} alt="" />
      </div>
      <div className={[classes.topbar_item, classes.stretch].join(' ')}>
        <PageTitle />
      </div>
      <div className={classes.topbar_item}>
        {username && (
          <a
            href="/legacy/narrativemanager/new"
            target="_blank"
            className={classes.narrative_link}
          >
            <Button variant="outlined" startIcon={<FAIcon icon={faPlus} />}>
              Narrative
            </Button>
          </a>
        )}
      </div>
      <div className={classes.topbar_item}>
        <Enviroment />
      </div>
      <div className={classes.topbar_item}>
        {username ? <UserMenu /> : <LoginPrompt />}
      </div>
    </header>
  );
}

const LoginPrompt: FC = () => (
  <Stack direction="row" spacing={1}>
    <Link role="button" to={'/login'} className={classes.login_prompt}>
      <Button variant="contained">Log in</Button>
    </Link>
    <Link role="button" to={'/signup'} className={classes.login_prompt}>
      <Button variant="outlined">Sign up</Button>
    </Link>
  </Stack>
);

const UserMenu: FC = () => {
  const username = useAppSelector(authUsername);
  const { data: profData } = getUserProfile.useQuery(
    useMemo(
      () => ({
        usernames: [username || ''],
      }),
      [username]
    ),
    { skip: !username }
  );
  const realname = profData?.[0]?.[0]?.user.realname;
  const logout = useLogout();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  return (
    <div className={classes.login_menu_container}>
      <Button
        id="user-menu-button"
        aria-controls={menuOpen ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? 'true' : undefined}
        className={classes.login_menu_button}
        onClick={handleClickMenu}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <UserAvatar />
          <Typography fontSize="small">{username}</Typography>
          <FAIcon icon={faSortDown} />
        </Stack>
      </Button>
      <Menu
        id="user-menu"
        className={classes.login_menu}
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'user-menu-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Typography className={classes.login_menu_username}>
          {realname}
        </Typography>
        <MenuItem onClick={handleCloseMenu}>
          <Link to="profile">
            <FAIcon className={classes.login_menu_icon} icon={faUser} />
            My Profile
          </Link>
        </MenuItem>
        <MenuItem onClick={handleCloseMenu}>
          <Link to="account">
            <FAIcon className={classes.login_menu_icon} icon={faIdCard} />
            My Account
          </Link>
        </MenuItem>
        <MenuItem onClick={() => logout()}>
          <FAIcon className={classes.login_menu_icon} icon={faSignOutAlt} />
          Log out
        </MenuItem>
      </Menu>
    </div>
  );
};

const useLogout = () => {
  const tokenId = useAppSelector(({ auth }) => auth.tokenInfo?.id);
  const dispatch = useAppDispatch();
  const [revoke] = revokeToken.useMutation();
  const navigate = useNavigate();

  if (!tokenId) return noOp;

  return () => {
    revoke(tokenId)
      .unwrap()
      .then(() => {
        dispatch(resetStateAction());
        // setAuth(null) follow the state reset to initialize the page as un-Authed
        dispatch(setAuth(null));
        toast('You have been signed out');
        navigate('/legacy/auth2/signedout');
      })
      .catch(() => {
        toast('Error, could not log out.');
      });
  };
};

const UserAvatar = () => {
  const username = useAppSelector(authUsername);
  const { data: profData } = getUserProfile.useQuery(
    useMemo(
      () => ({
        usernames: [username || ''],
      }),
      [username]
    ),
    { skip: !username }
  );
  const avatarUri = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = profData ? (profData[0][0]?.profile as any) : undefined;
    const avatarOption = profile?.userdata?.avatarOption || 'gravatar';
    if (avatarOption === 'gravatar') {
      const gravatarDefault = profile?.userdata?.gravatarDefault || 'identicon';
      const gravatarHash = profile?.synced?.gravatarHash;
      if (gravatarHash) {
        return `https://www.gravatar.com/avatar/${gravatarHash}?s=300&r=pg&d=${gravatarDefault}`;
      } else {
        return `https://${process.env.REACT_APP_KBASE_LEGACY_DOMAIN}/images/nouserpic.png`;
      }
    } else {
      return `https://${process.env.REACT_APP_KBASE_LEGACY_DOMAIN}/images/nouserpic.png`;
    }
  }, [profData]);
  return <img src={avatarUri} alt={'avatar'} style={{ width: '40px' }} />;
};

const PageTitle: FC = () => {
  const title = useAppSelector((state) => state.layout.pageTitle);
  return (
    <div className={classes.page_title}>
      <span>{title || ''}</span>
    </div>
  );
};

const Enviroment: FC = () => {
  const env = useAppSelector((state) => state.layout.environment);
  if (env === 'production') return null;
  const icon = {
    appdev: faWrench,
    ci: faFlask,
    'ci-europa': faFlask,
    'narrative-dev': faWrench,
    narrative2: faWrench,
    next: faWrench,
    unknown: faQuestionCircle,
  }[env];
  const txt = {
    appdev: 'APPDEV',
    ci: 'CI',
    'ci-europa': 'EUR',
    'narrative-dev': 'NARDEV',
    narrative2: 'NAR2',
    next: 'NEXT',
    unknown: 'ENV?',
  }[env];
  return (
    <div className={classes.environment}>
      <span>{txt}</span>
      <FAIcon icon={icon} />
    </div>
  );
};
