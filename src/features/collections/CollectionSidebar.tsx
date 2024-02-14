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
 * List of data products with associated metadata and listed
 * in the order they should appear in the sidebar.
 */
const dataProductsMeta = [
  {
    product: 'genome_attribs',
    displayName: 'Genome Attributes',
    section: 'Genomes',
  },
  {
    product: 'taxa_count',
    displayName: 'Taxa Count',
    section: 'Genomes',
  },
  {
    product: 'microtrait',
    displayName: 'Microtrait',
    section: 'Genomes',
  },
  {
    product: 'biolog',
    displayName: 'Biolog',
    section: 'Genomes',
  },
  {
    product: 'samples',
    displayName: 'Sample Attributes',
    section: 'Samples',
  },
];

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
  const genomeProducts = dataProductsMeta
    .filter((d) => d.section === 'Genomes')
    .map((d) => d.product);
  const sampleProducts = dataProductsMeta
    .filter((d) => d.section === 'Samples')
    .map((d) => d.product);

  collection.data_products.forEach((dp) => {
    const dpMeta = dataProductsMeta.find((d) => d.product === dp.product);
    const dpItem = {
      id: dp.product,
      displayText: dpMeta?.displayName || snakeCaseToHumanReadable(dp.product),
      pathname: `/collections/${collection.id}/${dp.product}`,
      isSelected: !showOverview && currDataProduct === dp,
    };
    if (genomeProducts.indexOf(dp.product) > -1) {
      genomesItems.push(dpItem);
    } else if (sampleProducts.indexOf(dp.product) > -1) {
      samplesItems.push(dpItem);
    }
  });

  // Enforce a certain order for the genomes sidebar items based on genomeProducts array
  genomesItems.sort((a, b) => {
    return genomeProducts.indexOf(a.id) - genomeProducts.indexOf(b.id);
  });

  // Enforce a certain order for the samples sidebar items based on sampleProducts array
  samplesItems.sort((a, b) => {
    return sampleProducts.indexOf(a.id) - sampleProducts.indexOf(b.id);
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
