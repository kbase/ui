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

/**
 * List of data product ids that should be grouped into the
 * "Genomes" category.
 */
const genomesDataProducts = [
  'genome_attribs',
  'microtrait',
  'taxa_count',
  'biolog',
];

/**
 * List of data product ids that should be grouped into the
 * "Samples" category.
 */
const samplesDataProducts = ['samples'];

interface DataProductIconMap {
  [id: string]: IconProp;
}

/**
 * Map data product ids to an icon component
 */
const dataProductIcon: DataProductIconMap = {
  overview: faList,
  genome_attribs: faDna,
  microtrait: faTableCells,
  taxa_count: faChartBar,
  biolog: faMicroscope,
  samples: faVial,
};

/**
 * Implementation of the Sidebar component for the CollectionDetail pages.
 * Takes a collection and renders its data products into a navigation sidebar.
 */
export const CollectionSidebar: FC<{
  collection: Collection;
  currDataProduct?: DataProduct;
  showOverview?: boolean;
  className?: string;
}> = ({ collection, currDataProduct, showOverview, className }) => {
  const navigate = useNavigate();
  const genomesItems: SidebarItem[] = [];
  const samplesItems: SidebarItem[] = [];

  collection.data_products?.forEach((dp) => {
    const dpItem = {
      displayText: snakeCaseToHumanReadable(dp.product),
      pathname: `/collections/${collection.id}/${dp.product}`,
      icon: <FontAwesomeIcon icon={dataProductIcon[dp.product]} />,
      isSelected: !showOverview && currDataProduct === dp,
    };
    if (genomesDataProducts.indexOf(dp.product) > -1) {
      genomesItems.push(dpItem);
    } else if (samplesDataProducts.indexOf(dp.product) > -1) {
      samplesItems.push(dpItem);
    }
  });

  // First item in genomeItems should be a section label
  if (genomesItems.length > 0) {
    genomesItems.unshift({
      displayText: 'Genomes',
      isSectionLabel: true,
    });
  }

  // First item in samplesItems should be a section label
  if (samplesItems.length > 0) {
    samplesItems.unshift({
      displayText: 'Samples',
      isSectionLabel: true,
    });
  }

  const items: SidebarItem[] = [
    // Right now the Overview item is added manually
    // In the future this could be part of collection.data_products
    {
      displayText: 'Overview',
      pathname: `/collections/${collection.id}/`,
      icon: <FontAwesomeIcon icon={dataProductIcon['overview']} />,
      isSelected: showOverview,
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
