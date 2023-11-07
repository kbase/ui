import { DataProduct, listCollections } from '../../common/api/collectionsApi';
import { useLocation, useNavigate } from 'react-router-dom';
import classes from './Sidebar.module.scss';
import { Card, CardList } from '../../common/components/Card';
import { FC, ReactElement } from 'react';
import { snakeCaseToHumanReadable } from '../../common/utils/stringUtils';
import { Link } from 'react-router-dom';

export interface SidebarItem {
  displayText: string;
  pathname?: string;
  isSelected?: boolean;
  isSectionLabel?: boolean;
  isSubItem?: boolean;
  icon?: ReactElement;
}

/**
 * 
 */
export const Sidebar: FC<{
  header?: ReactElement;
  items: SidebarItem[];
  className?: string;
}> = ({ header, items, className }) => {
  const location = useLocation();
  let classNames = classes['sidebar'];
  if (className) classNames += ` ${className}`;
  console.log(className);
  return (
    <div className={classNames}>
      {header && (
        <div className={classes['header']}>
          {header}
        </div>
      )}
      <ul>
        {items.map((item, i) => (
          <li
            key={`${item.displayText}-${i}`}
            className={getItemClassNames(item, classes)}
          >
            {item.pathname && (
              <Link to={{ pathname: item.pathname, search: location.search }}>
                {item.icon && (
                  <span className={classes['item-icon']}>{item.icon}</span>
                )}
                {item.displayText}
              </Link>
            )}
            {!item.pathname && (
              <span>
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

const getItemClassNames = (item: SidebarItem, classes: any) => {
  let itemClassNames = classes['sidebar-item'];
  if (item.isSelected) itemClassNames += ` ${classes['selected']}`;
  if (item.isSubItem) itemClassNames += ` ${classes['sub-item']}`;
  if (item.isSectionLabel) itemClassNames += ` ${classes['section-label']}`;
  return itemClassNames
}
