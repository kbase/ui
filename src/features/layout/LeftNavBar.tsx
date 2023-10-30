/* LeftNavBar */
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamation,
  faCompass,
  faUsers,
  faBook,
  faSearch,
  faSuitcase,
  faIdCard,
  faBullhorn,
  IconDefinition,
  faBoxesStacked,
} from '@fortawesome/free-solid-svg-icons';
import { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../common/hooks';
import { authMe, authToken } from '../auth/authSlice';
import { useAuthMe } from '../auth/hooks';
import classes from './LeftNavBar.module.scss';
import { getFeedsUnseenCount } from '../../common/api/feedsService';

const LeftNavBar: FC = () => {
  const token = useAppSelector(authToken);
  const { data: feeds } = getFeedsUnseenCount.useQuery(undefined, {
    skip: !token,
    pollingInterval: 10000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  return (
    <nav>
      <ul className={classes.nav_list}>
        <NavItem path="/" desc="Navigator" icon={faCompass} />
        <NavItem path="/legacy/orgs" desc="Orgs" icon={faUsers} />
        <NavItem path="/legacy/catalog/apps" desc="Catalog" icon={faBook} />
        <NavItem path="/legacy/search" desc="Search" icon={faSearch} />
        <NavItem path="/legacy/jobbrowser" desc="Jobs" icon={faSuitcase} />
        <NavItem path="/legacy/account" desc="Account" icon={faIdCard} />
        <NavItem
          path="/legacy/feeds"
          desc="Feeds"
          icon={faBullhorn}
          notifs={feeds?.unseen.global}
        />
        {token ? <DevNav /> : <></>}
      </ul>
    </nav>
  );
};

const devDomains = new Set(['', 'ci-europa.kbase.us']);

const DevNav: FC = () => {
  const me = useAppSelector(authMe);
  useAuthMe();
  // Show DevNav if the devDomains set contains the VITE_KBASE_DOMAIN.
  const devDomain = devDomains.has(import.meta.env.VITE_KBASE_DOMAIN || '');
  const customroles = me && new Set(me.customroles);
  const devRole = customroles && customroles.has('UI_COLLECTIONS');
  const dev = devDomain || devRole;
  if (!dev) return <></>;
  return (
    <>
      <NavItem path="/count" desc="Count" icon={faExclamation} />
      <NavItem path="/auth" desc="Auth" icon={faExclamation} />
      <NavItem path="/collections" desc="Collections" icon={faBoxesStacked} />
    </>
  );
};

const NavItem: FC<{
  path: string;
  desc: string;
  icon: IconDefinition;
  notifs?: number;
}> = ({ path, desc, icon, notifs }) => {
  const location = useLocation();
  let itemClasses = classes.nav_item;
  if (location.pathname === path) {
    itemClasses += ` ${classes.active}`;
  }
  return (
    <li className={itemClasses} key={path}>
      <Link to={path}>
        <FAIcon className={classes.nav_icon} icon={icon} />
        <span className={classes.nav_desc}>{desc}</span>
        {notifs && notifs > 0 ? (
          <span className={classes.nav_notifs}>{notifs}</span>
        ) : (
          <></>
        )}
      </Link>
    </li>
  );
};

export default LeftNavBar;
