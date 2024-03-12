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
import { Button, Input } from '../../common/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRightArrowLeft,
  faCircleCheck,
  faFilter,
} from '@fortawesome/free-solid-svg-icons';
import { useModalControls } from '../layout/Modal';
import { Loader } from '../../common/components/Loader';
import { CollectionSidebar, dataProductsMeta } from './CollectionSidebar';
import {
  clearFilter,
  clearFiltersAndColumnMeta,
  setColumnMeta,
  FilterState,
  setFilter,
  useCurrentSelection,
  useFilters,
  useMatchId,
} from './collectionsSlice';
import { useAppDispatch, useDebounce } from '../../common/hooks';
import { Slider, MenuItem, TextField, Stack, Divider } from '@mui/material';
import { useForm } from 'react-hook-form';
import { CollectionOverview } from './CollectionOverview';
import { FilterChip } from '../../common/components/FilterChip';

export const detailPath = ':id';
export const detailDataProductPath = ':id/:data_product';

type ModalView = 'match' | 'select' | 'export';
export type SetModalView = React.Dispatch<React.SetStateAction<ModalView>>;

const filterInputDebounceRate = 600;
const filterSliderDebounceRate = 100;

const pageConfig: Record<string, ('filter' | 'match' | 'search')[]> = {
  samples: ['filter'],
  biolog: ['filter'],
  microtrait: ['filter'],
  genome_attribs: ['filter', 'match', 'search'],
  taxa_count: ['filter', 'match'],
};

export const CollectionDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const collectionQuery = getCollection.useQuery(params.id || '', {
    skip: params.id === undefined,
  });
  const collection = collectionQuery.data;
  usePageTitle(`Data Collections`);

  // If no DataProduct is specified, show the overview.
  const showOverview = !params.data_product;
  // If the DataProduct is specified in the URL, show it.
  const currDataProduct =
    collection?.data_products.find(
      (dp) => dp.product === params.data_product
    ) || collection?.data_products[0];
  const currDataProductMeta = dataProductsMeta.find((d) => {
    return d.product === currDataProduct?.product;
  });
  // Set page title to data product display name or human-readbale
  const dataProductTitle =
    currDataProductMeta?.displayName ||
    (currDataProduct
      ? snakeCaseToHumanReadable(currDataProduct.product)
      : null);

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
  const [modalView, setModalView] = useState<ModalView>('match');

  const [filterOpen, setFiltersOpen] = useState(false);
  const filterMenuRef = useRef<HTMLButtonElement>(null);

  const handleToggleFilters = () => {
    setFiltersOpen(!filterOpen);
  };

  useEffect(() => {
    // When the currDataProduct/showOverview changes, close the filter menu
    return () => setFiltersOpen(false);
  }, [currDataProduct, showOverview]);

  const showMatchButton = (
    (params.data_product && pageConfig[params.data_product]) ||
    []
  ).includes('match');
  const showFilterButton = (
    (params.data_product && pageConfig[params.data_product]) ||
    []
  ).includes('filter');
  const showSearch = (
    (params.data_product && pageConfig[params.data_product]) ||
    []
  ).includes('search');

  if (!collection) return <Loader type="spinner" />;
  return (
    <div className={styles['collection_wrapper']}>
      <CollectionSidebar
        className={styles['collection_sidebar']}
        collection={collection}
        currDataProduct={currDataProduct}
        showOverview={showOverview}
      />
      <main className={styles['collection_main']}>
        <div className={styles['detail_header']}>
          <h2>
            {showOverview ? 'Overview' : currDataProduct && dataProductTitle}
          </h2>
          {!showOverview && (
            <>
              <div className={styles['collection_toolbar']}>
                <Stack direction="row" spacing={1}>
                  <Input
                    hidden={!showSearch}
                    className={styles['search-box']}
                    placeholder="Search genomes by classification"
                  />
                  <Button
                    hidden={!showFilterButton}
                    ref={filterMenuRef}
                    icon={<FontAwesomeIcon icon={faFilter} />}
                    onClick={handleToggleFilters}
                  >
                    Filters
                  </Button>
                  <Button
                    hidden={!showMatchButton}
                    icon={<FontAwesomeIcon icon={faArrowRightArrowLeft} />}
                    variant="contained"
                    onClick={() => {
                      setModalView('match');
                      modal?.show();
                    }}
                  >
                    {match
                      ? `Matching by ${MATCHER_LABELS.get(match.matcher_id)}`
                      : `Match my Data`}
                  </Button>
                </Stack>
                <Button
                  icon={<FontAwesomeIcon icon={faCircleCheck} />}
                  variant={selection.length > 0 ? 'contained' : 'outlined'}
                  textColor={selection.length > 0 ? 'white' : 'primary'}
                  onClick={() => {
                    setModalView('select');
                    modal?.show();
                  }}
                >
                  {`${selection.length} items in selection`}
                </Button>
              </div>
              <div>
                <FilterChips collectionId={collection.id} />
              </div>
            </>
          )}
        </div>
        <div className={styles['detail_content']}>
          <FilterMenu
            collectionId={collection.id}
            anchorEl={filterMenuRef.current}
            open={filterOpen}
            onClose={() => setFiltersOpen(false)}
          />
          <div className={styles['data_product_detail']}>
            {showOverview ? (
              <CollectionOverview
                collection_id={collection.id}
                setModalView={setModalView}
                modal={modal}
              />
            ) : currDataProduct ? (
              <DataProduct
                dataProduct={currDataProduct}
                collection_id={collection.id}
              />
            ) : (
              <></>
            )}
          </div>
        </div>
      </main>
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

const useFilterEntries = (collectionId: string) => {
  const { context, filters } = useCollectionFilters(collectionId);
  const dispatch = useAppDispatch();

  const filterEntries = Object.entries(filters || {});
  filterEntries.sort((a, b) => a[0].localeCompare(b[0]));

  const clearFilterState = (column: string) => {
    dispatch(clearFilter([collectionId, context, column]));
  };

  return { context, filters, filterEntries, clearFilterState };
};

const FilterChips = ({ collectionId }: { collectionId: string }) => {
  const { filterEntries, clearFilterState } = useFilterEntries(collectionId);
  if (filterEntries.length === 0) return <></>;
  return (
    <Stack
      direction={'row'}
      gap={'4px'}
      useFlexGap
      flexWrap="wrap"
      sx={{ paddingTop: '14px' }}
    >
      {filterEntries.map(([column, filter]) => {
        return (
          <FilterChip
            name={column}
            filter={filter}
            onDelete={() => clearFilterState(column)}
          />
        );
      })}
    </Stack>
  );
};

const FilterMenu = (props: {
  collectionId: string;
  anchorEl: Element | null;
  open: boolean;
  onClose: () => void;
}) => {
  const { context, filterEntries, clearFilterState } = useFilterEntries(
    props.collectionId
  );

  if (props.open) {
    return (
      <div className={styles['filters_panel']}>
        {filterEntries.flatMap(([column, filter]) => {
          const hasVal = Boolean(filter.value);
          const children = [
            <Divider key={column + '__label'} textAlign="left">
              <FilterChip
                name={column}
                filter={filter}
                color={hasVal ? 'primary' : 'default'}
                showValue={false}
                showWhenUnused={true}
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
      dispatch(clearFiltersAndColumnMeta([collectionId, context]));
      filterData.columns.forEach((column) => {
        const current = filters && filters[column.key];
        dispatch(setColumnMeta([collectionId, context, column.key, column]));
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
  const [sliderPosition, setSliderPosition] = useState<[string, string]>([
    values.min,
    values.max,
  ]);

  const setFilterRange = useDebounce(() => {
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
  });

  const submit = handleSubmit(() => {
    setFilterRange(0)();
  });

  const debounceSubmit = handleSubmit(() => {
    setFilterRange(filterInputDebounceRate)();
  });

  const debounceSubmitSliders = handleSubmit(() => {
    setFilterRange(filterSliderDebounceRate)();
  });

  useEffect(() => {
    //Set slider position from values
    setSliderPosition([values.min, values.max]);
  }, [values.min, values.max]);

  const [filterMin, filterMax] = [filter.min_value, filter.max_value];
  useEffect(() => {
    //Clear when the filter is cleared
    if (!filter.value) {
      setValue('min', formatDate(filterMin));
      setValue('max', formatDate(filterMax));
      setSliderPosition([formatDate(filterMin), formatDate(filterMax)]);
    }
  }, [filter.value, filterMax, filterMin, setValue]);

  return (
    <Stack>
      <Stack direction="row" spacing={2}>
        <TextField
          {...register('min', {
            valueAsDate: true,
            validate: (value) => parseDate(value) < parseDate(values.max),
            onBlur: submit,
            onChange: debounceSubmit,
          })}
          error={Boolean(minError)}
          size="small"
          variant="outlined"
        />
        <TextField
          {...register('max', {
            valueAsDate: true,
            validate: (value) => parseDate(value) > parseDate(values.min),
            onBlur: submit,
            onChange: debounceSubmit,
          })}
          error={Boolean(maxError)}
          size="small"
          variant="outlined"
        />
      </Stack>
      <Slider
        size="small"
        disableSwap
        getAriaLabel={() => `filter range for column ${column}`}
        value={sliderPosition.map(parseDate)}
        min={filter.min_value}
        max={filter.max_value}
        step={(filter.max_value - filter.min_value) / 100}
        valueLabelFormat={formatDate}
        marks={[filter.min_value, filter.max_value].map((v) => ({
          value: v,
          label: formatDate(v),
        }))}
        onChange={(ev, newValue) => {
          const range = newValue as [number, number];
          setValue('min', formatDate(range[0]));
          setValue('max', formatDate(range[1]));
          const sliderRange: [string, string] = [
            formatDate(range[0]),
            formatDate(range[1]),
          ];
          setSliderPosition(sliderRange);
          debounceSubmitSliders();
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
  const [sliderPosition, setSliderPosition] = useState<[number, number]>([
    values.min,
    values.max,
  ]);

  const setFilterRange = useDebounce(() => {
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
  });

  const submit = handleSubmit(() => {
    setFilterRange(0)();
  });

  const debounceSubmit = handleSubmit(() => {
    setFilterRange(filterInputDebounceRate)();
  });

  const debounceSubmitSliders = handleSubmit(() => {
    setFilterRange(filterSliderDebounceRate)();
  });

  useEffect(() => {
    //Set slider position from values
    setSliderPosition([values.min, values.max]);
  }, [values.min, values.max]);

  const [filterMin, filterMax] = [filter.min_value, filter.max_value];
  useEffect(() => {
    //Clear when the filter is cleared
    if (!filter.value) {
      setValue('min', filterMin);
      setValue('max', filterMax);
      setSliderPosition([filterMin, filterMax]);
    }
  }, [filter.value, filterMax, filterMin, setValue]);

  return (
    <Stack>
      <Stack direction="row" spacing={2}>
        <TextField
          {...register('min', {
            valueAsNumber: true,
            validate: (value) =>
              value < values.max &&
              (filter.type === 'float' || Number.isInteger(value)),
            onChange: debounceSubmit,
            onBlur: submit,
          })}
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
            onChange: debounceSubmit,
            onBlur: submit,
          })}
          error={Boolean(maxError)}
          size="small"
          variant="outlined"
        />
      </Stack>
      <Slider
        size="small"
        disableSwap
        getAriaLabel={() => `filter range for column ${column}`}
        value={sliderPosition}
        min={filter.min_value}
        max={filter.max_value}
        step={
          filter.type === 'int'
            ? 1
            : (filter.max_value - filter.min_value) / 100
        }
        marks={[filter.min_value, filter.max_value].map((v) => ({
          value: v,
          label: v,
        }))}
        onChange={(ev, newValue) => {
          const range = newValue as [number, number];
          setValue('min', range[0]);
          setValue('max', range[1]);
          setSliderPosition([range[0], range[1]]);
          debounceSubmitSliders();
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

  const debounceSubmit = useDebounce((value: string) => {
    dispatch(setFilter([collectionId, context, column, { ...filter, value }]));
  });

  return (
    <TextField
      key={column}
      value={text}
      onChange={(e) => {
        setText(e.currentTarget.value);
        debounceSubmit(filterInputDebounceRate)(e.currentTarget.value);
      }}
      onBlur={(e) => {
        setText(e.currentTarget.value);
        debounceSubmit(0)(e.currentTarget.value);
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
