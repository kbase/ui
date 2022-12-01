import { useParams } from 'react-router-dom';
import {
  DataProduct as DataProductType,
  getCollection,
} from '../../common/api/collectionsApi';
import { usePageTitle } from '../layout/layoutSlice';
import styles from './Collections.module.scss';
import { Card, CardList } from '../../common/components/Card';
import { useEffect, useState } from 'react';
import { DataProduct } from './DataProduct';
import { snakeCaseToHumanReadable } from '../../common/utils/stringUtils';

export const CollectionDetail = () => {
  const { id } = useParams();
  const collectionQuery = getCollection.useQuery(id || '', {
    skip: id === undefined,
  });
  const collection = collectionQuery.data;
  usePageTitle(`Data Collections`);

  // State for data_product tabs
  const [selectedDP, setSelectedDP] = useState<DataProductType>();
  // Keep selectedDP up to date if collection reloads
  useEffect(() => {
    const matchingDP = collection?.data_products.find(
      (dp) =>
        dp.product === selectedDP?.product && dp.version === selectedDP?.version
    );
    if (matchingDP) {
      setSelectedDP(matchingDP);
    } else {
      setSelectedDP(undefined);
    }
  }, [collection?.data_products, selectedDP]);

  if (!collection) return <>loading...</>;
  return (
    <div className={styles['collection_wrapper']}>
      <div className={styles['collection_detail']}>
        <div className={styles['detail_header']}>
          <img
            src={collection.icon_url}
            alt={`${collection.name} collection icon`}
          />
          <span>{collection.name}</span>
        </div>

        <p>{collection.desc}</p>

        <ul>
          <li>
            Version:{' '}
            <strong>
              v{collection.ver_num}: {collection.ver_tag}
            </strong>
          </li>
        </ul>
      </div>
      <div className={styles['data_products']}>
        <CardList className={styles['data_product_list']}>
          {collection.data_products.map((dp) => (
            <Card
              key={dp.product + '|' + dp.version}
              title={snakeCaseToHumanReadable(dp.product)}
              subtitle={dp.version}
              onClick={() => setSelectedDP(dp)}
              selected={selectedDP === dp}
            />
          ))}
        </CardList>
        <div className={styles['data_product_detail']}>
          {selectedDP ? (
            <DataProduct
              dataProduct={selectedDP}
              collection_id={collection.id}
            />
          ) : (
            <div className={styles['data_product_placeholder']}>
              <span>Select a Data Product</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
