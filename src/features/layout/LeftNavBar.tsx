/* LeftNavBar */
import {
  faBook,
  faBullhorn,
  faCompass,
  faIdCard,
  faLayerGroup,
  faSearch,
  faSuitcase,
  faUsers,
  IconDefinition,
  faEllipsis,
  faInfoCircle,
  faQuestionCircle,
  faServer,
  faNoteSticky,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { FC, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getFeedsUnseenCount } from '../../common/api/feedsService';
import { useAppSelector } from '../../common/hooks';
import { authMe, authToken } from '../auth/authSlice';
import { useAuthMe } from '../auth/hooks';
import classes from './LeftNavBar.module.scss';
import { Button, Menu, MenuItem } from '@mui/material';

const LeftNavBar: FC = () => {
  const token = useAppSelector(authToken);
  const { data: feeds } = getFeedsUnseenCount.useQuery(undefined, {
    skip: !token,
    pollingInterval: 10000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const moreMenuOpen = Boolean(anchorEl);
  const handleClickMoreMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMoreMenu = () => {
    setAnchorEl(null);
  };

  return (
    <nav>
      <ul className={classes.nav_list}>
        <NavItem path="/" desc="Navigator" icon={faCompass} />
        <NavItem path="/legacy/orgs" desc="Orgs" icon={faUsers} />
        <NavItem path="/legacy/catalog/apps" desc="Catalog" icon={faBook} />
        <NavItem path="/legacy/search" desc="Search" icon={faSearch} />
        <NavItem path="/legacy/jobbrowser" desc="Jobs" icon={faSuitcase} />
        <NavItem path="/account" desc="Account" icon={faIdCard} />
        <NavItem
          path="/legacy/feeds"
          desc="Feeds"
          icon={faBullhorn}
          badge={feeds?.unseen.global}
        />
        <NavItem
          path="/collections"
          desc="Collections"
          icon={faLayerGroup}
          badge={'beta'}
          badgeColor={'primary'}
        />
        <DevNav />
      </ul>
      <ul className={classes.nav_list}>
        <Button
          className={classes.nav_item}
          id="more-item"
          aria-controls={moreMenuOpen ? 'more-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={moreMenuOpen ? 'true' : undefined}
          onClick={handleClickMoreMenu}
        >
          <FAIcon className={classes.nav_icon} icon={faEllipsis} />
          <span className={classes.nav_desc}>More</span>
        </Button>
        <Menu
          id="more-menu"
          anchorEl={anchorEl}
          open={moreMenuOpen}
          onClose={handleCloseMoreMenu}
          MenuListProps={{
            'aria-labelledby': 'more-item',
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <MenuItem
            className={classes.more_menu_item}
            onClick={handleCloseMoreMenu}
          >
            <Link to="/legacy/about">
              <FAIcon className={classes.more_menu_icon} icon={faInfoCircle} />
              About
            </Link>
          </MenuItem>
          <MenuItem
            className={classes.more_menu_item}
            onClick={handleCloseMoreMenu}
          >
            <Link to="/legacy/about/services">
              <FAIcon className={classes.more_menu_icon} icon={faServer} />
              Services
            </Link>
          </MenuItem>
          <MenuItem
            className={classes.more_menu_item}
            onClick={handleCloseMoreMenu}
          >
            <a
              href="https://www.kbase.us/support/"
              target="_blank"
              rel="noreferrer"
            >
              <FAIcon
                className={classes.more_menu_icon}
                icon={faQuestionCircle}
              />
              Support
            </a>
          </MenuItem>
          <MenuItem
            className={classes.more_menu_item}
            onClick={handleCloseMoreMenu}
          >
            <a href="https://docs.kbase.us/" target="_blank" rel="noreferrer">
              <FAIcon className={classes.more_menu_icon} icon={faNoteSticky} />
              Documentation
            </a>
          </MenuItem>
        </Menu>
      </ul>
    </nav>
  );
};

const devDomains = new Set(['', 'ci-europa.kbase.us']);

/** Hidden navigation items for devs */
const DevNav: FC = () => {
  const me = useAppSelector(authMe);
  useAuthMe();
  // Show DevNav if the devDomains set contains the REACT_APP_KBASE_DOMAIN.
  const devDomain = devDomains.has(process.env.REACT_APP_KBASE_DOMAIN || '');
  const customroles = me && new Set(me.customroles);
  const devRole = customroles && customroles.has('UI_COLLECTIONS');
  const dev = devDomain || devRole;
  if (!me || !dev) return <></>;
  return (
    <>
      {/* Nothing here now, heres an example:
      <NavItem
        path="/collections"
        desc="Collections"
        icon={faLayerGroup}
        badge={'beta'}
        badgeColor={'primary'}
      /> */}
    </>
  );
};

const NavItem: FC<{
  path: string;
  desc: string;
  icon: IconDefinition;
  badge?: number | string;
  badgeColor?: string;
}> = ({ path, desc, icon, badge, badgeColor }) => {
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
        {badge ? (
          <span
            className={[
              classes.nav_notifs,
              badgeColor ? classes[`nav_notifs-bg--${badgeColor}`] : '',
            ].join(' ')}
          >
            {badge}
          </span>
        ) : (
          <></>
        )}
      </Link>
    </li>
  );
};

export default LeftNavBar;
