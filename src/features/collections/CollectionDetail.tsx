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
  FilterState,
  setFilter,
  useCurrentSelection,
  useFilters,
  useMatchId,
} from './collectionsSlice';
import { useAppDispatch } from '../../common/hooks';
import {
  Slider,
  MenuItem,
  TextField,
  Stack,
  Divider,
  Chip,
  Paper,
} from '@mui/material';
import { useForm } from 'react-hook-form';

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

  const modal = useModalControls();
  type ModalView = 'match' | 'select' | 'export';
  const [modalView, setModalView] = useState<ModalView>('match');

  const [filterOpen, setFiltersOpen] = useState(false);
  const filterMenuRef = useRef<HTMLButtonElement>(null);

  const handleToggleFilters = () => {
    setFiltersOpen(!filterOpen);
  };

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
              onClick={handleToggleFilters}
            >
              Filters
            </Button>
            {/* <FilterMenu
              collectionId={collection.id}
              anchorEl={filterMenuRef.current}
              open={filterOpen}
              onClose={() => setFiltersOpen(false)}
            /> */}
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
          <FilterMenu
            collectionId={collection.id}
            anchorEl={filterMenuRef.current}
            open={filterOpen}
            onClose={() => setFiltersOpen(false)}
          />
          <div className={styles['data_product_detail']}>
            {currDataProduct ? (
              <Paper variant="outlined">
                <DataProduct
                  dataProduct={currDataProduct}
                  collection_id={collection.id}
                />
              </Paper>
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

const FilterMenu = (props: {
  collectionId: string;
  anchorEl: Element | null;
  open: boolean;
  onClose: () => void;
}) => {
  const { context, filters } = useCollectionFilters(props.collectionId);
  const dispatch = useAppDispatch();

  const filterEntries = Object.entries(filters || {});
  filterEntries.sort((a, b) => a[0].localeCompare(b[0]));

  const clearFilterState = (column: string) => {
    dispatch(clearFilter([props.collectionId, context, column]));
  };

  if (props.open) {
    return (
      <div className={styles['filters_panel']}>
        {filterEntries.flatMap(([column, filter]) => {
          const hasVal = Boolean(filter.value);
          const children = [
            <Divider key={column + '__label'} textAlign="left">
              <Chip
                label={column}
                color={hasVal ? 'primary' : 'default'}
                onDelete={hasVal ? () => clearFilterState(column) : undefined}
              />
            </Divider>,
            <MenuItem>
              <FilterControls
                column={column}
                filter={filter}
                context={context}
                collectionId={props.collectionId}
              />
            </MenuItem>,
          ];
          return children;
        })}
      </div>
    );
  } else {
    return null;
  }
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

interface FilterControlProps {
  column: string;
  filter: FilterState;
  collectionId: string;
  context: string;
}

const FilterControls = ({
  column,
  filter,
  collectionId,
  context,
}: FilterControlProps) => {
  if (
    filter.type === 'fulltext' ||
    filter.type === 'prefix' ||
    filter.type === 'identity' ||
    filter.type === 'ngram'
  ) {
    return (
      <TextFilterControls
        column={column}
        filter={filter}
        context={context}
        collectionId={collectionId}
      />
    );
  } else if (filter.type === 'int' || filter.type === 'float') {
    return (
      <RangeFilterControls
        column={column}
        filter={filter}
        context={context}
        collectionId={collectionId}
      />
    );
  } else if (filter.type === 'date') {
    return (
      <DateRangeFilterControls
        column={column}
        filter={filter}
        context={context}
        collectionId={collectionId}
      />
    );
  }
  return null;
};

const DateRangeFilterControls = ({
  column,
  filter,
  collectionId,
  context,
}: FilterControlProps & {
  filter: { type: 'date' };
}) => {
  const formatDate = (d: number) => new Date(d).toISOString();
  const parseDate = (d: string) => new Date(d).getTime();
  // initial defaults
  const [defMin, defMax] = (
    filter.value?.range ?? [filter.min_value, filter.max_value]
  ).map(formatDate);

  const {
    register,
    handleSubmit,
    getFieldState,
    formState,
    getValues,
    setValue,
  } = useForm({
    defaultValues: { min: defMin, max: defMax },
    reValidateMode: 'onChange',
  });
  const values = getValues();
  const { error: minError } = getFieldState('min', formState);
  const { error: maxError } = getFieldState('max', formState);
  const dispatch = useAppDispatch();
  const sliderTimeout = useRef<number>();

  const setFilterRange = () => {
    const validState = getValues();
    const shouldClear =
      parseDate(validState.min) === filter.min_value &&
      parseDate(validState.max) === filter.max_value;
    if (shouldClear) {
      dispatch(clearFilter([collectionId, context, column]));
    } else {
      dispatch(
        setFilter([
          collectionId,
          context,
          column,
          {
            ...filter,
            value: {
              ...filter.value,
              range: [parseDate(validState.min), parseDate(validState.max)],
            },
          },
        ])
      );
    }
  };

  const submit = handleSubmit(() => {
    setFilterRange();
  });

  return (
    <Stack>
      <Stack direction="row" spacing={2}>
        <TextField
          {...register('min', {
            valueAsDate: true,
            validate: (value) => parseDate(value) < parseDate(values.max),
          })}
          onBlur={submit}
          error={Boolean(minError)}
          size="small"
          variant="outlined"
        />
        <TextField
          {...register('max', {
            valueAsDate: true,
            validate: (value) => parseDate(value) > parseDate(values.min),
          })}
          onBlur={submit}
          error={Boolean(maxError)}
          size="small"
          variant="outlined"
        />
      </Stack>
      <Slider
        size="small"
        disableSwap
        getAriaLabel={() => `filter range for column ${column}`}
        value={[parseDate(values.min), parseDate(values.max)]}
        min={filter.min_value}
        max={filter.max_value}
        valueLabelFormat={formatDate}
        marks={[filter.min_value, filter.max_value].map((v) => ({
          value: v,
          label: formatDate(v),
        }))}
        onChange={(ev, newValue) => {
          const range = newValue as [number, number];
          setValue('min', formatDate(range[0]));
          setValue('max', formatDate(range[1]));
          // Debounce setting the filter state from the slider for better UX
          if (sliderTimeout.current) clearTimeout(sliderTimeout.current);
          sliderTimeout.current = window.setTimeout(() => {
            submit();
          }, 100);
        }}
        valueLabelDisplay="auto"
      />
    </Stack>
  );
};

const RangeFilterControls = ({
  column,
  filter,
  collectionId,
  context,
}: FilterControlProps & {
  filter: { type: 'float' | 'int' };
}) => {
  // initial defaults
  const [defMin, defMax] = filter.value?.range ?? [
    filter.min_value,
    filter.max_value,
  ];
  const {
    register,
    handleSubmit,
    getFieldState,
    formState,
    getValues,
    setValue,
  } = useForm({
    defaultValues: { min: defMin, max: defMax },
    reValidateMode: 'onChange',
  });
  const values = getValues();
  const { error: minError } = getFieldState('min', formState);
  const { error: maxError } = getFieldState('max', formState);
  const dispatch = useAppDispatch();
  const sliderTimeout = useRef<number>();

  const setFilterRange = () => {
    const validState = getValues();
    const shouldClear =
      validState.min === filter.min_value &&
      validState.max === filter.max_value;
    if (shouldClear) {
      dispatch(clearFilter([collectionId, context, column]));
    } else {
      dispatch(
        setFilter([
          collectionId,
          context,
          column,
          {
            ...filter,
            value: {
              ...filter.value,
              range: [validState.min, validState.max],
            },
          },
        ])
      );
    }
  };

  const submit = handleSubmit(() => {
    setFilterRange();
  });

  return (
    <Stack>
      <Stack direction="row" spacing={2}>
        <TextField
          {...register('min', {
            valueAsNumber: true,
            validate: (value) =>
              value < values.max &&
              (filter.type === 'float' || Number.isInteger(value)),
          })}
          onBlur={submit}
          error={Boolean(minError)}
          size="small"
          variant="outlined"
        />
        <TextField
          {...register('max', {
            valueAsNumber: true,
            validate: (value) =>
              value > values.min &&
              (filter.type === 'float' || Number.isInteger(value)),
          })}
          onBlur={submit}
          error={Boolean(maxError)}
          size="small"
          variant="outlined"
        />
      </Stack>
      <Slider
        size="small"
        disableSwap
        getAriaLabel={() => `filter range for column ${column}`}
        value={[values.min, values.max]}
        min={filter.min_value}
        max={filter.max_value}
        marks={[filter.min_value, filter.max_value].map((v) => ({
          value: v,
          label: v,
        }))}
        onChange={(ev, newValue) => {
          const range = newValue as [number, number];
          setValue('min', range[0]);
          setValue('max', range[1]);
          // Debounce setting the filter state from the slider for better UX
          if (sliderTimeout.current) clearTimeout(sliderTimeout.current);
          sliderTimeout.current = window.setTimeout(() => {
            submit();
          }, 100);
        }}
        valueLabelDisplay="auto"
      />
    </Stack>
  );
};

const TextFilterControls = ({
  column,
  filter,
  collectionId,
  context,
}: FilterControlProps & {
  filter: { type: 'fulltext' | 'identity' | 'prefix' | 'ngram' };
}) => {
  const dispatch = useAppDispatch();
  const [text, setText] = useState<string>(filter.value ?? '');

  return (
    <TextField
      key={column}
      value={text}
      onChange={(e) => setText(e.currentTarget.value)}
      onBlur={(e) => {
        dispatch(
          setFilter([
            collectionId,
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
  );
};
