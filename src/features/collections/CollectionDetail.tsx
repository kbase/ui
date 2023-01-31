import { useParams, useNavigate } from 'react-router-dom';
import { getCollection } from '../../common/api/collectionsApi';
import { usePageTitle } from '../layout/layoutSlice';
import styles from './Collections.module.scss';
import { Card, CardList } from '../../common/components/Card';
import { useEffect } from 'react';
import { DataProduct } from './DataProduct';
import { snakeCaseToHumanReadable } from '../../common/utils/stringUtils';

export const detailPath = ':id';
export const detailDataProductPath = ':id/:data_product';

export const CollectionDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const collectionQuery = getCollection.useQuery(params.id || '', {
    skip: params.id === undefined,
  });
  const collection = collectionQuery.data;
  usePageTitle(`Data Collections`);

  const currDataProduct = collection?.data_products.find(
    (dp) => dp.product === params.data_product
  );

  // Redirect if the data_product specified by the url DNE
  useEffect(() => {
    if (params.data_product && collection && !currDataProduct) {
      navigate(`/collections/${params.id}`);
    }
  }, [params.id, params.data_product, collection, currDataProduct, navigate]);

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
              onClick={() =>
                navigate(`/collections/${collection.id}/${dp.product}`)
              }
              selected={currDataProduct === dp}
            />
          ))}
        </CardList>
        <div className={styles['data_product_detail']}>
          {currDataProduct ? (
            <DataProduct
              dataProduct={currDataProduct}
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
