import { useLocation } from 'react-router-dom';
import classes from './Sidebar.module.scss';
import { FC, ReactElement } from 'react';
import { Link } from 'react-router-dom';

export interface SidebarItem {
  displayText: string;
  pathname?: string;
  isSelected?: boolean;
  isSectionLabel?: boolean;
  icon?: ReactElement;
}

/**
 * Generic sidebar navigation component
 */
export const Sidebar: FC<{
  header?: ReactElement;
  items: SidebarItem[];
  className?: string;
}> = ({ header, items, className }) => {
  const location = useLocation();
  let classNames = classes['sidebar'];
  if (className) classNames += ` ${className}`;
  return (
    <div className={classNames}>
      {header && <div className={classes['header']}>{header}</div>}
      <ul>
        {items.map((item, i) => (
          <li
            key={`${item.displayText}-${i}`}
            className={getItemClassNames(item, classes)}
          >
            {item.pathname && (
              <Link
                to={{ pathname: item.pathname, search: location.search }}
                className={classes['sidebar-item-inner']}
              >
                {item.icon && (
                  <span className={classes['item-icon']}>{item.icon}</span>
                )}
                {item.displayText}
              </Link>
            )}
            {!item.pathname && (
              <span className={classes['sidebar-item-inner']}>
                {item.icon && (
                  <span className={classes['item-icon']}>{item.icon}</span>
                )}
                {item.displayText}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getItemClassNames = (item: SidebarItem, classes: any) => {
  let itemClassNames = classes['sidebar-item'];
  if (item.isSelected) itemClassNames += ` ${classes['selected']}`;
  if (item.isSectionLabel) itemClassNames += ` ${classes['section-label']}`;
  return itemClassNames;
};
