import { Collection, DataProduct } from '../../common/api/collectionsApi';
import { FC } from 'react';
import { snakeCaseToHumanReadable } from '../../common/utils/stringUtils';
import { Sidebar, SidebarItem } from '../../common/components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDna, faArrowLeft, faVial } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../common/components/Button';
import { useNavigate } from 'react-router-dom';
import classes from './Collections.module.scss';

const genomesDataProducts = [
  'genome_attribs',
  'microtrait',
  'taxa_count',
  'biolog',
];

const samplesDataProducts = ['samples'];

/**
 *
 */
export const CollectionSidebar: FC<{
  collection: Collection;
  currDataProduct?: DataProduct;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataProducts: any[];
  className?: string;
}> = ({ collection, currDataProduct, dataProducts, className }) => {
  const navigate = useNavigate();
  const genomesItems: SidebarItem[] = [];
  const samplesItems: SidebarItem[] = [];

  dataProducts?.forEach((dp) => {
    const dpItem = {
      displayText: snakeCaseToHumanReadable(dp.product),
      pathname: `/collections/${collection.id}/${dp.product}`,
      isSelected: currDataProduct === dp,
    };
    if (genomesDataProducts.indexOf(dp.product) > -1) {
      genomesItems.push(dpItem);
    } else if (samplesDataProducts.indexOf(dp.product) > -1) {
      samplesItems.push(dpItem);
    }
  });

  if (genomesItems.length > 0) {
    genomesItems.unshift({
      displayText: 'Genomes',
      icon: <FontAwesomeIcon icon={faDna} />,
      isSectionLabel: true,
    });
  }

  if (samplesItems.length > 0) {
    samplesItems.unshift({
      displayText: 'Samples',
      icon: <FontAwesomeIcon icon={faVial} />,
      isSectionLabel: true,
    });
  }

  const items: SidebarItem[] = [
    {
      displayText: 'Overview',
      pathname: `/collections/${collection.id}/overview`,
    },
    ...genomesItems,
    ...samplesItems,
  ];

  const sidebarHeader = (
    <div className={classes['sidebar-header']}>
      <Button
        variant="text"
        role="link"
        icon={<FontAwesomeIcon icon={faArrowLeft} />}
        onClick={() => {
          navigate('/collections');
        }}
      >
        Back to Collections
      </Button>
      <div>
        <div className={classes['sidebar-image-wrapper']}>
          <img
            src={collection.icon_url}
            alt={`${collection.name} collection icon`}
          />
        </div>
        <h1>{collection.name}</h1>
      </div>
    </div>
  );

  return <Sidebar className={className} header={sidebarHeader} items={items} />;
};
