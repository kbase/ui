import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  getCollection,
  getGenomeAttribsMeta,
  getMatch,
} from '../../common/api/collectionsApi';
import { usePageTitle } from '../layout/layoutSlice';
import styles from './Collections.module.scss';
import { useEffect, useRef, useState } from 'react';
import { DataProduct } from './DataProduct';
import { snakeCaseToHumanReadable } from '../../common/utils/stringUtils';
import { MATCHER_LABELS, MatchModal } from './MatchModal';
import { SelectionModal } from './SelectionModal';
import { ExportModal } from './ExportModal';
import { Button } from '../../common/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRightArrowLeft,
  faCircleCheck,
  faFilter,
} from '@fortawesome/free-solid-svg-icons';
import { useModalControls } from '../layout/Modal';
import { Loader } from '../../common/components/Loader';
import { CollectionSidebar } from './CollectionSidebar';
import {
  clearFilter,
  clearFilters,
  setFilter,
  useCurrentSelection,
  useFilters,
  useMatchId,
} from './collectionsSlice';
import { useAppDispatch } from '../../common/hooks';
import {
  Slider,
  Menu,
  MenuItem,
  TextField,
  Stack,
  Divider,
  Chip,
} from '@mui/material';

export const detailPath = ':id';
export const detailDataProductPath = ':id/:data_product';

export const CollectionDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

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

  const selection = useCurrentSelection(collection?.id);
  const matchId = useMatchId(collection?.id);
  const matchQuery = getMatch.useQuery(matchId || '', {
    skip: !matchId,
  });
  const match = matchQuery.data;
  const { context, filters } = useCollectionFilters(collection?.id);
  const dispatch = useAppDispatch();

  const [filterOpen, setFiltersOpen] = useState(false);
  const filterMenuRef = useRef<HTMLButtonElement>(null);
  const filterEntries = Object.entries(filters || {});
  filterEntries.sort((a, b) => a[0].localeCompare(b[0]));

  const filterMenu = (
    <div>
      <Menu
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        anchorEl={filterMenuRef.current}
        open={filterOpen}
        onClose={() => setFiltersOpen(false)}
      >
        {filterEntries.flatMap(([column, filter]) => {
          const hasVal = Boolean(filter.value);
          const children = [
            <Divider key={column + '__label'} textAlign="left">
              <Chip
                label={column}
                color={hasVal ? 'primary' : 'default'}
                onDelete={
                  hasVal
                    ? () => {
                        dispatch(
                          clearFilter([collection?.id || '', context, column])
                        );
                      }
                    : undefined
                }
              />
            </Divider>,
          ];
          if (
            filter.type === 'float' ||
            filter.type === 'int' ||
            filter.type === 'date'
          ) {
            const valRange = filter.value?.range ?? [
              filter.min_value,
              filter.max_value,
            ];
            const formatVal = (n: number | string) =>
              filter.type === 'date' ? new Date(n).toLocaleString() : n;
            children.push(
              <MenuItem>
                <Stack>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      size="small"
                      key={column + '__min'}
                      helperText={'min'}
                      value={formatVal(valRange[0])}
                      variant="outlined"
                    />
                    <TextField
                      size="small"
                      key={column + '__max'}
                      value={formatVal(valRange[1])}
                      helperText={'max'}
                      variant="outlined"
                    />
                  </Stack>
                  <Slider
                    size="small"
                    key={column}
                    disableSwap
                    getAriaLabel={() => `filter range for column ${column}`}
                    value={valRange}
                    min={filter.min_value}
                    max={filter.max_value}
                    valueLabelFormat={formatVal}
                    marks={[filter.min_value, filter.max_value].map((v) => ({
                      value: v,
                      label: formatVal(v),
                    }))}
                    onChange={(ev, newValue) =>
                      dispatch(
                        setFilter([
                          collection?.id || '',
                          context,
                          column,
                          {
                            ...filter,
                            value: {
                              ...filter.value,
                              range: newValue as [number, number],
                            },
                          },
                        ])
                      )
                    }
                    valueLabelDisplay="auto"
                  />
                </Stack>
              </MenuItem>
            );
          } else if (
            filter.type === 'fulltext' ||
            filter.type === 'prefix' ||
            filter.type === 'identity' ||
            filter.type === 'ngram'
          ) {
            children.push(
              <MenuItem>
                <TextField
                  key={column}
                  value={filter.value}
                  onChange={(e) => {
                    dispatch(
                      setFilter([
                        collection?.id || '',
                        context,
                        column,
                        { ...filter, value: e.currentTarget.value },
                      ])
                    );
                  }}
                  helperText={
                    {
                      fulltext: 'Word Search',
                      identity: 'Exact Match',
                      prefix: 'Prefix Match',
                      ngram: 'N-gram Search',
                    }[filter.type]
                  }
                  variant="standard"
                />
              </MenuItem>
            );
          }
          return children;
        })}
      </Menu>
    </div>
  );

  const modal = useModalControls();
  type ModalView = 'match' | 'select' | 'export';
  const [modalView, setModalView] = useState<ModalView>('match');

  if (!collection) return <Loader type="spinner" />;
  return (
    <div className={styles['collection_wrapper']}>
      <CollectionSidebar
        className={styles['collection_sidebar']}
        collection={collection}
        currDataProduct={currDataProduct}
      />
      <div className={styles['collection_main']}>
        <div className={styles['detail_header']}>
          <h2>
            {currDataProduct &&
              snakeCaseToHumanReadable(currDataProduct.product)}
          </h2>
          <div className={styles['collection_toolbar']}>
            <Button
              ref={filterMenuRef}
              icon={<FontAwesomeIcon icon={faFilter} />}
              variant="outlined"
              color={'primary-lighter'}
              textColor={'primary'}
              onClick={() => {
                setFiltersOpen(true);
              }}
            >
              Filters
            </Button>
            {filterMenu}
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
        <div className={styles['container']}>
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

const useCollectionFilters = (collectionId: string | undefined) => {
  const dispatch = useAppDispatch();
  const { context, filters } = useFilters(collectionId);
  const { data: filterData, isLoading } = getGenomeAttribsMeta.useQuery(
    { collection_id: collectionId || '' },
    { skip: !collectionId }
  );
  useEffect(() => {
    if (collectionId && filterData) {
      dispatch(clearFilters([collectionId, context]));
      filterData.columns.forEach((column) => {
        const current = filters && filters[column.key];
        if (
          column.type === 'date' ||
          column.type === 'float' ||
          column.type === 'int'
        ) {
          let min = column.min_value;
          let max = column.max_value;
          if (column.type === 'date') {
            min = new Date(min).getTime();
            max = new Date(max).getTime();
          }
          dispatch(
            setFilter([
              collectionId,
              context,
              column.key,
              {
                type: column.type,
                min_value: min,
                max_value: max,
                value:
                  current?.type === column.type ? current.value : undefined,
              },
            ])
          );
        } else if (column.type === 'string') {
          dispatch(
            setFilter([
              collectionId,
              context,
              column.key,
              {
                type: column.filter_strategy,
                value:
                  current?.type === column.filter_strategy
                    ? current.value
                    : undefined,
              },
            ])
          );
        }
      });
    }
    // Exclude filters from deps to prevent circular dep
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterData, context, collectionId, dispatch]);
  return { filters, context, isLoading };
};
