import { DataProduct } from '../../common/api/collectionsApi';
import { FC } from 'react';
import { snakeCaseToHumanReadable } from '../../common/utils/stringUtils';
import { Sidebar, SidebarItem } from '../../common/components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faDna } from '@fortawesome/free-solid-svg-icons';

/**
 *
 */
export const CollectionSidebar: FC<{
  collectionId: string;
  currDataProduct?: DataProduct;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataProducts: any[];
  className?: string;
}> = ({ collectionId, currDataProduct, dataProducts, className }) => {
  const items: SidebarItem[] = [
    {
      displayText: 'Overview',
      pathname: 'overview',
      icon: <FontAwesomeIcon icon={faList} />,
    },
    {
      displayText: 'Genomes',
      pathname: 'overview',
      icon: <FontAwesomeIcon icon={faDna} />,
    },
  ];

  dataProducts?.forEach((dp) => {
    items.push({
      displayText: snakeCaseToHumanReadable(dp.product),
      pathname: `/collections/${collectionId}/${dp.product}`,
      isSelected: currDataProduct === dp,
      isSubItem: true,
    });
  });

  return <Sidebar className={className} header={<h1>Test</h1>} items={items} />;
};
