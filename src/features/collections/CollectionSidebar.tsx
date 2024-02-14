import { Collection, DataProduct } from '../../common/api/collectionsApi';
import { FC } from 'react';
import { snakeCaseToHumanReadable } from '../../common/utils/stringUtils';
import { Sidebar, SidebarItem } from '../../common/components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDna, faArrowLeft, faVial } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../common/components/Button';
import { useNavigate } from 'react-router-dom';
import classes from './Collections.module.scss';

/**
 * List of data product ids that should be grouped into the
 * "Genomes" category.
 */
const genomesDataProducts = [
  'genome_attribs',
  'taxa_count',
  'microtrait',
  'biolog',
];

/**
 * List of data product ids that should be grouped into the
 * "Samples" category.
 */
const samplesDataProducts = ['samples'];

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

  collection.data_products.forEach((dp) => {
    const dpItem = {
      id: dp.product,
      displayText: snakeCaseToHumanReadable(dp.product),
      pathname: `/collections/${collection.id}/${dp.product}`,
      isSelected: !showOverview && currDataProduct === dp,
    };
    if (genomesDataProducts.indexOf(dp.product) > -1) {
      genomesItems.push(dpItem);
    } else if (samplesDataProducts.indexOf(dp.product) > -1) {
      samplesItems.push(dpItem);
    }
  });

  // Enforce a certain order for the genomes sidebar items based on genomesDataProducts array
  genomesItems.sort((a, b) => {
    return (
      genomesDataProducts.indexOf(a.id) - genomesDataProducts.indexOf(b.id)
    );
  });

  // Enforce a certain order for the samples sidebar items based on samplesDataProducts array
  samplesItems.sort((a, b) => {
    return (
      samplesDataProducts.indexOf(a.id) - samplesDataProducts.indexOf(b.id)
    );
  });

  // First item in genomeItems should be a section label
  if (genomesItems.length > 0) {
    genomesItems.unshift({
      id: 'geneomes_section',
      displayText: 'Genomes',
      icon: <FontAwesomeIcon icon={faDna} />,
      isSectionLabel: true,
    });
  }

  // First item in samplesItems should be a section label
  if (samplesItems.length > 0) {
    samplesItems.unshift({
      id: 'samples_section',
      displayText: 'Samples',
      icon: <FontAwesomeIcon icon={faVial} />,
      isSectionLabel: true,
    });
  }

  const items: SidebarItem[] = [
    // Add Overview item to the top of the sidebar list
    {
      id: 'overview',
      displayText: 'Overview',
      pathname: `/collections/${collection.id}/`,
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
