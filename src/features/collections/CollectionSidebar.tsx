import { Collection, DataProduct } from '../../common/api/collectionsApi';
import { FC } from 'react';
import { snakeCaseToHumanReadable } from '../../common/utils/stringUtils';
import { Sidebar, SidebarItem } from '../../common/components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDna,
  faArrowLeft,
  faVial,
  faChartBar,
  faTableCells,
  faMicroscope,
  faList,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../common/components/Button';
import { useNavigate } from 'react-router-dom';
import classes from './Collections.module.scss';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

const genomesDataProducts = [
  'genome_attribs',
  'microtrait',
  'taxa_count',
  'biolog',
];

interface DataProductIconMap {
  [id: string]: IconProp;
}

const dataProductIcon: DataProductIconMap = {
  overview: faList,
  genome_attribs: faDna,
  microtrait: faTableCells,
  taxa_count: faChartBar,
  biolog: faMicroscope,
  samples: faVial,
};

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
      icon: <FontAwesomeIcon icon={dataProductIcon[dp.product]} />,
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
      isSectionLabel: true,
    });
  }

  if (samplesItems.length > 0) {
    samplesItems.unshift({
      displayText: 'Samples',
      isSectionLabel: true,
    });
  }

  const items: SidebarItem[] = [
    {
      displayText: 'Overview',
      pathname: `/collections/${collection.id}/overview`,
      icon: <FontAwesomeIcon icon={dataProductIcon['overview']} />,
      isSelected: currDataProduct?.product === 'overview',
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
