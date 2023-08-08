import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getCollection, getMatch } from '../../common/api/collectionsApi';
import { usePageTitle } from '../layout/layoutSlice';
import styles from './Collections.module.scss';
import { Card, CardList } from '../../common/components/Card';
import { useEffect } from 'react';
import { DataProduct } from './DataProduct';
import { snakeCaseToHumanReadable } from '../../common/utils/stringUtils';
import { MATCHER_LABELS, MatchPane } from './MatchPane';
import { SelectionPane } from './SelectionPane';
import { ExportPane } from './ExportPane';
import { Button } from '../../common/components';
import { useAppSelector } from '../../common/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRightArrowLeft,
  faChevronLeft,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useAppParam } from '../params/hooks';

export const detailPath = ':id';
export const detailDataProductPath = ':id/:data_product';

export const CollectionDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const matchId = useAppParam('match');

  const selection = useAppSelector(
    (state) => state.collections.currentSelection
  );

  const matchQuery = getMatch.useQuery(matchId || '', {
    skip: !matchId,
  });
  const match = matchQuery.data;

  const collectionQuery = getCollection.useQuery(params.id || '', {
    skip: params.id === undefined,
  });
  const collection = collectionQuery.data;
  usePageTitle(`Data Collections`);

  // If the DataProduct is specified in the URL, show it, otherwise show the first DP.
  const currDataProduct =
    collection?.data_products.find(
      (dp) => dp.product === params.data_product
    ) || collection?.data_products[0];

  // Redirect if the data_product specified by the url DNE
  useEffect(() => {
    if (
      params.data_product &&
      (collection?.data_products.length ?? 0) > 0 &&
      !currDataProduct
    ) {
      navigate({
        pathname: `/collections/${params.id}`,
        search: location.search,
      });
    }
  }, [
    params.id,
    params.data_product,
    collection,
    currDataProduct,
    navigate,
    location.search,
  ]);

  if (!collection) return <>loading...</>;
  return (
    <div className={styles['collection_wrapper']}>
      <div className={styles['collection_detail']}>
        <div>
          <Button
            variant="text"
            role="link"
            icon={<FontAwesomeIcon icon={faChevronLeft} />}
            onClick={() => {
              navigate('/collections');
            }}
          >
            Back to Collections
          </Button>
        </div>
      </div>
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

      <div className={styles['collection_detail']}>
        <div className={styles['collection_toolbar']}>
          <Button
            icon={<FontAwesomeIcon icon={faArrowRightArrowLeft} />}
            variant="outlined"
            color={match ? 'primary' : 'primary-lighter'}
            textColor={match ? 'primary-lighter' : 'primary'}
          >
            {match
              ? `Matching by ${MATCHER_LABELS.get(match.matcher_id)}`
              : `Match my Data`}
          </Button>
          <Button
            icon={<FontAwesomeIcon icon={faCircleCheck} />}
            variant="outlined"
            color={selection.length > 0 ? 'primary' : 'primary-lighter'}
            textColor={selection.length > 0 ? 'primary-lighter' : 'primary'}
          >
            {`${selection.length} items in selection`}
          </Button>
        </div>
      </div>

      <div className={styles['data_products']}>
        <CardList className={styles['data_product_list']}>
          {collection.data_products.map((dp) => (
            <Card
              key={dp.product + '|' + dp.version}
              title={snakeCaseToHumanReadable(dp.product)}
              subtitle={dp.version}
              onClick={() =>
                navigate({
                  pathname: `/collections/${collection.id}/${dp.product}`,
                  search: location.search,
                })
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
          ) : null}
        </div>
      </div>
      <div className={styles['collection_detail']}>
        <MatchPane collectionId={collection.id} />
        <SelectionPane collectionId={collection.id} />
        <ExportPane collectionId={collection.id} />
      </div>
    </div>
  );
};
