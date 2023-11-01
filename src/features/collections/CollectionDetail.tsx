import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getCollection, getMatch } from '../../common/api/collectionsApi';
import { usePageTitle } from '../layout/layoutSlice';
import styles from './Collections.module.scss';
import { Card, CardList } from '../../common/components/Card';
import { useEffect, useState } from 'react';
import { DataProduct } from './DataProduct';
import { snakeCaseToHumanReadable } from '../../common/utils/stringUtils';
import { MATCHER_LABELS, MatchModal } from './MatchModal';
import { SelectionModal } from './SelectionModal';
import { ExportModal } from './ExportModal';
import { Button } from '../../common/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRightArrowLeft,
  faChevronLeft,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useAppParam } from '../params/hooks';
import { useModalControls } from '../layout/Modal';
import { Loader } from '../../common/components/Loader';
import { useCurrentSelection } from './collectionsSlice';

export const detailPath = ':id';
export const detailDataProductPath = ':id/:data_product';

export const CollectionDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const matchId = useAppParam('match');

  const matchQuery = getMatch.useQuery(matchId || '', {
    skip: !matchId,
  });
  const match = matchQuery.data;

  const collectionQuery = getCollection.useQuery(params.id || '', {
    skip: params.id === undefined,
  });
  const collection = collectionQuery.data;
  usePageTitle(`Data Collections`);

  const selection = useCurrentSelection(collection?.id);

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

  const modal = useModalControls();
  type ModalView = 'match' | 'select' | 'export';
  const [modalView, setModalView] = useState<ModalView>('match');

  if (!collection) return <Loader type="spinner" />;
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
            onClick={() => {
              setModalView('match');
              modal?.show();
            }}
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
            onClick={() => {
              setModalView('select');
              modal?.show();
            }}
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
          ) : (
            <></>
          )}
        </div>
      </div>
      {modalView === 'match' ? (
        <MatchModal
          key={[collection.id, matchId].join('|')}
          collectionId={collection.id}
        />
      ) : modalView === 'select' ? (
        <SelectionModal
          key={collection.id}
          collectionId={collection.id}
          showExport={() => setModalView('export')}
        />
      ) : modalView === 'export' ? (
        <ExportModal key={collection.id} collectionId={collection.id} />
      ) : (
        <></>
      )}
    </div>
  );
};
