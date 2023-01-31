import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
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
  faSignOutAlt,
  faSortDown,
  faSquare,
  faUser,
  faWrench,
} from '@fortawesome/free-solid-svg-icons';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from '../../common/assets/logo/46_square.png';
import { Dropdown } from '../../common/components';
import { useAppSelector } from '../../common/hooks';
import { authUsername } from '../auth/authSlice';
import { profileRealname } from '../profile/profileSlice';
import classes from './TopBar.module.scss';

export default function TopBar() {
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
        <Enviroment />
      </div>
      <div className={classes.topbar_item}>
        <LoginMenu />
      </div>
    </header>
  );
}

const LoginMenu: FC = () => {
  const username = useAppSelector(authUsername);
  const realname = useAppSelector(profileRealname);
  const navigate = useNavigate();
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
                label: (
                  <div>
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
                value: '/profile',
                icon: <FAIcon icon={faUser} />,
                label: 'Your Profile',
              },
              {
                value: '#your_account',
                icon: <FAIcon icon={faIdCard} />,
                label: 'Your Account',
              },
            ],
          },
          {
            options: [
              {
                value: '#sign_out',
                icon: <FAIcon icon={faSignOutAlt} />,
                label: 'Sign Out',
              },
            ],
          },
        ]}
        onChange={(opt) => {
          if (opt?.[0]) navigate(opt[0].value as string);
        }}
      >
        <div className={classes.login_menu_button}>
          <FAIcon className={classes.login_menu_icon} icon={faSquare} />
          <FAIcon icon={faSortDown} />
        </div>
      </Dropdown>
    </div>
  );
};

const HamburgerMenu: FC = () => {
  return (
    <div className={classes.hamburger_menu}>
      <Dropdown
        options={[
          {
            options: [
              {
                value: window.location.origin + '/#narrativemanager/start',
                icon: <FAIcon icon={faFile} />,
                label: 'Narrative Interface',
              },
              {
                value: window.location.origin + '/#narrativemanager/new',
                icon: <FAIcon icon={faPlus} />,
                label: 'New Narrative',
              },
              {
                value: window.location.origin + '/#jgi-search',
                icon: <FAIcon icon={faSearch} />,
                label: 'JGI Search',
              },
              {
                value: window.location.origin + '/#biochem-search',
                icon: <FAIcon icon={faSearch} />,
                label: 'Biochem Search',
              },
            ],
          },
          {
            options: [
              {
                value: window.location.origin + '/#about/services',
                icon: <FAIcon icon={faServer} />,
                label: 'KBase Services Status',
              },
            ],
          },
          {
            options: [
              {
                value: window.location.origin + '/#about',
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
          if (opt?.[0]) window.location.href = opt[0].value as string;
        }}
      >
        <FAIcon className={classes.hamburger_menu_icon} icon={faBars} />
      </Dropdown>
    </div>
  );
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
    ci: faFlask,
    'ci-europa': faFlask,
    unknown: faQuestionCircle,
    appdev: faWrench,
  }[env];
  const txt = {
    ci: 'CI',
    'ci-europa': 'EUR',
    unknown: '??',
    appdev: 'APPDEV',
  }[env];
  return (
    <div className={classes.environment}>
      <span>{txt}</span>
      <FAIcon icon={icon} />
    </div>
  );
};
