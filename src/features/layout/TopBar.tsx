import {
  faBars,
  faEnvelope,
  faFile,
  faFlask,
  faIdCard,
  faInfo,
  faPlus,
  faQuestion,
  faQuestionCircle,
  faSearch,
  faServer,
  faSignIn,
  faSignOutAlt,
  faSortDown,
  faUser,
  faWrench,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Link } from 'react-router-dom';
import { LOGIN_ROUTE } from '../../app/Routes';
import { getUserProfile } from '../../common/api/userProfileApi';
import logo from '../../common/assets/logo/46_square.png';
import { Dropdown } from '../../common/components';
import { useAppSelector } from '../../common/hooks';
import { authUsername } from '../auth/authSlice';
import { useLogout } from '../auth/hooks';
import { NextRequestObject } from '../legacy/messageValidation';
import classes from './TopBar.module.scss';

/**
 * A set of url pathname regular expressions which, when matching the current url
 * pathname, cause the "next request" parameter to be omitted from login.
 */
const NEXT_REQUEST_BLACKLIST: Array<RegExp> = [
  /^\/legacy\/signedout/,
  /^\/legacy\/auth2\/signedout/,
  /^\/legacy\/login/,
  /^\/fallback/,
];

export default function TopBar() {
  const username = useAppSelector(authUsername);

  return (
    <header className={classes.topbar}>
      <div className={classes.topbar_item}>
        <HamburgerMenu />
      </div>
      <div className={classes.topbar_item}>
        <img src={logo} alt="" />
      </div>
      <div className={[classes.topbar_item, classes.stretch].join(' ')}>
        <PageTitle />
      </div>
      <div className={classes.topbar_item}>
        <Environment />
      </div>
      <div className={classes.topbar_item}>
        {username ? <UserMenu /> : <LoginPrompt />}
      </div>
    </header>
  );
}

const LoginPrompt: FC = () => {
  // We form a "next request", essentially a redirect back to the current location after
  // sign in, except for a few bespoke pages, the login page and the signedout page.
  const nextRequest: NextRequestObject | undefined = (() => {
    const pathname = window.location.pathname;
    if (
      NEXT_REQUEST_BLACKLIST.some((blacklistedPath) => {
        return blacklistedPath.test(pathname);
      })
    ) {
      return;
    }
    return {
      path: {
        path: pathname,
        type: 'europaui',
      },
    };
  })();

  const url = new URL(window.location.origin);
  if (nextRequest) {
    url.searchParams.set('nextrequest', JSON.stringify(nextRequest));
  }
  url.pathname = LOGIN_ROUTE;

  // Sign in should be disabled on the sign-in page! The sign-in page may have a search
  // param suffix, so we split it off.
  return (
    <Link
      role="button"
      to={{ pathname: url.pathname, search: url.searchParams.toString() }}
      className={classes.login_prompt}
    >
      <FAIcon icon={faSignIn} />
      <span>Sign In</span>
    </Link>
  );
};

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
  const navigate = useNavigate();
  const logout = useLogout();
  return (
    <div className={classes.login_menu}>
      <Dropdown
        horizontalMenuAlign="right"
        options={[
          {
            options: [
              {
                value: '',
                icon: undefined,
                fullWidth: true,
                label: (
                  <div className={classes['name_item']}>
                    <div>{realname}</div>
                    <div className={classes.login_menu_username}>
                      {username}
                    </div>
                  </div>
                ),
              },
            ],
          },
          {
            options: [
              {
                value: '/legacy/people',
                icon: <FAIcon icon={faUser} />,
                label: 'Your Profile',
              },
              {
                value: '/legacy/account',
                icon: <FAIcon icon={faIdCard} />,
                label: 'Your Account',
              },
            ],
          },
          {
            options: [
              {
                value: 'LOGOUT',
                icon: <FAIcon icon={faSignOutAlt} />,
                label: 'Sign Out',
              },
            ],
          },
        ]}
        onChange={(opt) => {
          if (opt?.[0]) {
            if (opt[0].value === 'LOGOUT') {
              logout();
            } else {
              navigate(opt[0].value as string);
            }
          }
        }}
      >
        <div className={classes.login_menu_button}>
          <UserAvatar />
          <FAIcon icon={faSortDown} />
        </div>
      </Dropdown>
    </div>
  );
};

const HamburgerMenu: FC = () => {
  const navigate = useNavigate();
  return (
    <div className={classes.hamburger_menu}>
      <Dropdown
        options={[
          {
            options: [
              {
                value: '/legacy/narrativemanager/start',
                icon: <FAIcon icon={faFile} />,
                label: 'Narrative Interface',
              },
              {
                value: '/legacy/narrativemanager/new',
                icon: <FAIcon icon={faPlus} />,
                label: 'New Narrative',
              },
              {
                value: '/legacy/jgi-search',
                icon: <FAIcon icon={faSearch} />,
                label: 'JGI Search',
              },
              {
                value: '/legacy/biochem-search',
                icon: <FAIcon icon={faSearch} />,
                label: 'Biochem Search',
              },
            ],
          },
          {
            options: [
              {
                value: '/legacy/about/services',
                icon: <FAIcon icon={faServer} />,
                label: 'KBase Services Status',
              },
              {
                value: '/legacy/orcidlink',
                icon: <FAIcon icon={faServer} />,
                label: 'KBase ORCID Link',
              },
            ],
          },
          {
            options: [
              {
                value: '/legacy/about',
                icon: <FAIcon icon={faInfo} />,
                label: 'About',
              },
              {
                value: 'https://kbase.us/contact-us',
                icon: <FAIcon icon={faEnvelope} />,
                label: 'Contact KBase',
              },
              {
                value: 'https://kbase.us/narrative-guide/',
                icon: <FAIcon icon={faQuestion} />,
                label: 'Support',
              },
            ],
          },
        ]}
        onChange={(opt) => {
          if (typeof opt?.[0]?.value === 'string') {
            if (opt[0].value.startsWith('http')) {
              window.location.href = opt[0].value;
            } else {
              navigate(opt[0].value, { relative: 'path' });
            }
          }
        }}
      >
        <FAIcon className={classes.hamburger_menu_icon} icon={faBars} />
      </Dropdown>
    </div>
  );
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

const Environment: FC = () => {
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
