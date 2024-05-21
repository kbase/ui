import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getCollection, getMatch } from '../../common/api/collectionsApi';
import { usePageTitle } from '../layout/layoutSlice';
import styles from './Collections.module.scss';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DataProduct } from './DataProduct';
import {
  countDecimals,
  snakeCaseToHumanReadable,
} from '../../common/utils/stringUtils';
import { MATCHER_LABELS, MatchModal } from './MatchModal';
import { ExportModal } from './ExportModal';
import { Button, Input } from '../../common/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRightArrowLeft,
  faSliders,
  faAngleRight,
  faX,
  faCircleXmark,
  faFileExport,
} from '@fortawesome/free-solid-svg-icons';
import { useModalControls } from '../layout/Modal';
import { Loader } from '../../common/components/Loader';
import { CollectionSidebar, dataProductsMeta } from './CollectionSidebar';
import {
  clearFilter,
  FilterState,
  setFilter,
  useCurrentSelection,
  useFilters,
  useMatchId,
  clearAllFilters,
  setFilterPanelOpen,
} from './collectionsSlice';
import { useAppDispatch, useDebounce } from '../../common/hooks';
import {
  Slider,
  TextField,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { CollectionOverview } from './CollectionOverview';
import { FilterChip } from '../../common/components/FilterChip';
import { filterContextScope, FilterContextTabs } from './Filters';

export const detailPath = ':id';
export const detailDataProductPath = ':id/:data_product';

type ModalView = 'match' | 'select' | 'export';
export type SetModalView = React.Dispatch<React.SetStateAction<ModalView>>;

const filterInputDebounceRate = 600;
const filterSliderDebounceRate = 100;

const pageConfig: Record<
  string,
  {
    features: ('filter' | 'match' | 'search')[];
  }
> = {
  samples: { features: ['filter'] },
  biolog: { features: ['filter'] },
  microtrait: { features: ['filter'] },
  genome_attribs: {
    features: ['filter', 'match', 'search'],
  },
  taxa_count: { features: ['match'] },
};

export const CollectionDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

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
  const match = matchQuery.currentData;

  const modal = useModalControls();
  const [modalView, setModalView] = useState<ModalView>('match');

  const { filterPanelOpen } = useFilters(collection?.id);
  const filterMenuRef = useRef<HTMLButtonElement>(null);
  const { filterEntries } = useFilterEntries(collection?.id || '');

  const handleToggleFilters = () => {
    if (collection?.id) {
      dispatch(setFilterPanelOpen(!filterPanelOpen));
    }
  };

  useEffect(() => {
    // When the currDataProduct/showOverview changes, close the filter menu
    return () => {
      if (collection?.id) {
        dispatch(setFilterPanelOpen(false));
      }
    };
  }, [dispatch, currDataProduct, showOverview, collection?.id]);

  const showMatchButton = (
    (params.data_product && pageConfig[params.data_product].features) ||
    []
  ).includes('match');
  const showFilterButton = (
    (params.data_product && pageConfig[params.data_product].features) ||
    []
  ).includes('filter');
  const showSearch = (
    (params.data_product && pageConfig[params.data_product].features) ||
    []
  ).includes('search');

  const { context, filters } = useFilters(collection?.id);
  const [searchText, setSearchText] = useState('');
  const searchTextRef = useRef(searchText);
  searchTextRef.current = searchText;

  const handleSearchDebounced = useDebounce<
    React.ChangeEventHandler<HTMLInputElement>
  >((e) => {
    // HARDCODED Here we are using the `classification` filter as our default search filter
    const filter = filters?.['classification'];
    if (
      !collection ||
      !filter ||
      filter.type === 'int' ||
      filter.type === 'float' ||
      filter.type === 'date' ||
      filter.type === 'bool'
    )
      return;
    if (e.target.value === filter.value) return;
    const type = filter.type;
    const value = e.target.value.length > 3 ? e.target.value : '';
    dispatch(
      setFilter([
        collection.id,
        context,
        'classification',
        { ...filter, type, value },
      ])
    );
  });

  const searchFilterValue = filters?.['classification']?.value;

  useEffect(() => {
    if (typeof searchFilterValue !== 'string') return;
    if (searchTextRef.current !== searchFilterValue)
      setSearchText(searchFilterValue);
  }, [searchFilterValue]);

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
                  {showSearch && (
                    <Input
                      value={searchText}
                      className={styles['search-box']}
                      placeholder="Search genomes by classification"
                      onChange={(e) => {
                        setSearchText(e.currentTarget.value);
                        handleSearchDebounced(200)(e);
                      }}
                    />
                  )}
                  {showMatchButton && (
                    <Button
                      icon={<FontAwesomeIcon icon={faArrowRightArrowLeft} />}
                      color="accent-warm-light"
                      onClick={() => {
                        setModalView('match');
                        modal?.show();
                      }}
                    >
                      {match
                        ? `Matching by ${MATCHER_LABELS.get(match.matcher_id)}`
                        : `Match My Data`}
                    </Button>
                  )}
                </Stack>
                <Button
                  icon={<FontAwesomeIcon icon={faFileExport} />}
                  variant={selection.length > 0 ? 'contained' : 'outlined'}
                  textColor={selection.length > 0 ? 'white' : 'primary'}
                  onClick={() => {
                    setModalView('export');
                    modal?.show();
                  }}
                >
                  {`Export (${selection.length.toLocaleString()} selected ${
                    selection.length === 1 ? 'item' : 'items'
                  })`}
                </Button>
              </div>
              <div className={styles['context-tabs']}>
                <FilterContextTabs collectionId={collection.id} />
              </div>
            </>
          )}
        </div>
        <div className={styles['detail_content']}>
          <FilterMenu
            collectionId={collection.id}
            anchorEl={filterMenuRef.current}
            open={filterPanelOpen ?? false}
            onClose={() => {
              if (collection?.id) {
                dispatch(setFilterPanelOpen(false));
              }
            }}
          />
          <div className={styles['data_product_detail']}>
            {showOverview ? (
              <CollectionOverview
                collection_id={collection.id}
                setModalView={setModalView}
                modal={modal}
              />
            ) : currDataProduct ? (
              <>
                {showFilterButton && (
                  <Stack
                    className={styles['filter-controls']}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                  >
                    <Button
                      ref={filterMenuRef}
                      icon={<FontAwesomeIcon icon={faSliders} />}
                      onClick={handleToggleFilters}
                    >
                      Filters
                    </Button>
                    <div className={styles['filter-chips-label']}>
                      {filterEntries ? filterEntries.length : '0'} active{' '}
                      {filterEntries && filterEntries.length !== 1
                        ? 'filters'
                        : 'filter'}
                      {filterEntries && filterEntries.length > 0 ? ':' : ''}
                    </div>
                    <FilterChips collectionId={collection.id} />
                  </Stack>
                )}
                <DataProduct
                  dataProduct={currDataProduct}
                  collection_id={collection.id}
                />
              </>
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
      ) : modalView === 'export' ? (
        <ExportModal key={collection.id} collectionId={collection.id} />
      ) : (
        <></>
      )}
    </div>
  );
};

const useFilterEntries = (collectionId: string) => {
  const { context, filters, columnMeta } = useFilters(collectionId);
  const dispatch = useAppDispatch();

  const categories = Array.from(
    Object.values(columnMeta ?? {}).reduce((catSet, column) => {
      if (column.category) catSet.add(column.category);
      return catSet;
    }, new Set<string>())
  );

  // Categorize filters and order categories
  const categorizedFilters = useMemo(
    () =>
      categories
        .sort((a, b) => {
          if (a === 'Other') {
            return 1;
          } else if (b === 'Other') {
            return -1;
          } else {
            return a.localeCompare(b);
          }
        })
        .map((category) => ({
          category: category,
          filters: Object.entries(filters ?? []).filter(
            ([filterName, filter]) =>
              columnMeta?.[filterName].category === category
          ),
        })),
    [categories, filters, columnMeta]
  );

  // Use same filter order if ignoring categories for consistency
  // Only include filters who have a non-undefined value
  const filterEntries = categorizedFilters.reduce<[string, FilterState][]>(
    (filterEntires, category) => {
      const activeFilters = category.filters.filter(
        (f) => f[1].value !== undefined
      );
      filterEntires.push(...activeFilters);
      return filterEntires;
    },
    []
  );

  const clearFilterState = (column: string) => {
    dispatch(clearFilter([collectionId, context, column]));
  };

  const clearAllFiltersState = () => {
    dispatch(clearAllFilters([collectionId, context]));
  };

  return {
    context,
    filters,
    filterEntries,
    clearFilterState,
    clearAllFiltersState,
    categorizedFilters,
  };
};

const FilterChips = ({ collectionId }: { collectionId: string }) => {
  const { columnMeta } = useFilters(collectionId);
  const { filterEntries, clearFilterState, context } =
    useFilterEntries(collectionId);
  if (filterEntries.length === 0) return <></>;
  return (
    <Stack direction={'row'} gap={'4px'} useFlexGap flexWrap="wrap">
      {filterEntries.map(([column, filter]) => {
        return (
          <FilterChip
            filter={filter}
            key={`${column}-${context}-${filter.type}`}
            name={columnMeta?.[column]?.display_name || column}
            onDelete={() => clearFilterState(column)}
          />
        );
      })}
    </Stack>
  );
};

const FilterMenu = ({
  collectionId,
  open,
  onClose,
  ...rest
}: {
  collectionId: string;
  anchorEl: Element | null;
  open: boolean;
  onClose: () => void;
}) => {
  const { columnMeta } = useFilters(collectionId);
  const {
    context,
    categorizedFilters,
    clearFilterState,
    clearAllFiltersState,
  } = useFilterEntries(collectionId);

  /**
   * Store expanded category string, empty string for none expanded
   */
  const [expandedCategory, setExpandedCategory] = useState('');

  /**
   * Only allow one category to be expanded at a time.
   */
  const handleExpand = (expanded: boolean, category: string) => {
    setExpandedCategory(expanded ? category : '');
  };

  const menuLabel = {
    DEFAULT: 'Filters',
    genomes: 'Genome Filters',
    samples: 'Sample Filters',
    biolog: 'Biolog Filters',
    microtrait: 'Microtrait Filters',
  }[filterContextScope(context) || 'DEFAULT'];

  if (open) {
    return (
      <div className={styles['filters_panel']}>
        <Stack direction="row" className={styles['filters-panel-header']}>
          <h3>{menuLabel}</h3>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              color="gray"
              onClick={() => clearAllFiltersState()}
            >
              Reset
            </Button>
            <Button
              role="button"
              color="base"
              variant="text"
              onClick={() => onClose()}
            >
              <FontAwesomeIcon icon={faX} />
            </Button>
          </Stack>
        </Stack>
        <div>
          {categorizedFilters.map((category) => {
            return (
              <Accordion
                key={`${category.category}-${context}`}
                className={styles['filter-category']}
                elevation={0}
                expanded={category.category === expandedCategory}
                onChange={(e, expanded) =>
                  handleExpand(expanded, category.category)
                }
              >
                <AccordionSummary
                  expandIcon={<FontAwesomeIcon icon={faAngleRight} />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                  sx={{
                    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                      transform: 'rotate(90deg)',
                    },
                  }}
                >
                  <h4 className={styles['filter-category-label']}>
                    {category.category}
                  </h4>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={3}>
                    {category.filters.flatMap(([column, filter]) => {
                      const hasVal =
                        filter.value !== undefined && filter.value !== null;
                      return (
                        <Stack
                          className={styles['filter-container']}
                          spacing={1}
                          key={`${column}-${context}_container`}
                        >
                          <div>
                            <label
                              className={`${styles['filter-label']} ${
                                hasVal ? styles['active'] : ''
                              }`}
                              onClick={
                                hasVal
                                  ? () => clearFilterState(column)
                                  : undefined
                              }
                            >
                              {columnMeta
                                ? columnMeta[column].display_name
                                : snakeCaseToHumanReadable(column)}
                              {hasVal && (
                                <FontAwesomeIcon icon={faCircleXmark} />
                              )}
                            </label>
                          </div>
                          <FilterControls
                            column={column}
                            filter={filter}
                            context={context}
                            collectionId={collectionId}
                          />
                        </Stack>
                      );
                    })}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </div>
      </div>
    );
  } else {
    return null;
  }
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
  } else if (filter.type === 'bool') {
    return (
      <BooleanFilterControls
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
    shouldFocusError: false,
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

  const validateMin = useCallback(
    (value: string, max: string) =>
      parseDate(value) <= parseDate(max) && !Number.isNaN(parseDate(value)),
    []
  );

  const validateMax = useCallback(
    (value: string, min: string) =>
      parseDate(value) >= parseDate(min) && !Number.isNaN(parseDate(value)),
    []
  );

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
    //Set slider position from values, if valid
    if (
      validateMin(values.min, values.max) &&
      validateMax(values.max, values.min)
    )
      setSliderPosition([values.min, values.max]);
  }, [values.min, values.max, validateMin, validateMax]);

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
            validate: (value) => validateMin(value, values.max),
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
            validate: (value) => validateMax(value, values.min),
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
    shouldFocusError: false,
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

  const validateMin = useCallback(
    (value: number, max: number) =>
      value <= max &&
      (filter.type === 'float' || Number.isInteger(value)) &&
      !Number.isNaN(value),
    [filter.type]
  );

  const validateMax = useCallback(
    (value: number, min: number) =>
      value >= min &&
      (filter.type === 'float' || Number.isInteger(value)) &&
      !Number.isNaN(value),
    [filter.type]
  );

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
    //Set slider position from values, if valid
    if (
      validateMin(values.min, values.max) &&
      validateMax(values.max, values.min)
    )
      setSliderPosition([values.min, values.max]);
  }, [values.min, values.max, validateMin, validateMax]);

  const [filterMin, filterMax] = [filter.min_value, filter.max_value];
  useEffect(() => {
    //Clear when the filter is cleared
    if (filter.value === undefined || filter.value === null) {
      setValue('min', filterMin);
      setValue('max', filterMax);
      setSliderPosition([filterMin, filterMax]);
    }
  }, [filter.value, filterMax, filterMin, setValue]);

  // Find the greatest number of decimal places used between the
  // filter's max and min and use 10^-numDecimals as the step
  const getStep = (min: number, max: number) => {
    const numDecimals = Math.max(countDecimals(min), countDecimals(max));
    return parseFloat(Math.pow(10, -1 * numDecimals).toFixed(numDecimals));
  };

  return (
    <Stack className={styles['range-filter']}>
      <Stack direction="row" spacing={2}>
        <TextField
          {...register('min', {
            valueAsNumber: true,
            validate: (value) => validateMin(value, values.max),
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
            validate: (value) => validateMax(value, values.min),
            onChange: debounceSubmit,
            onBlur: submit,
          })}
          error={Boolean(maxError)}
          size="small"
          variant="outlined"
        />
      </Stack>
      <Stack className={styles['slider-container']}>
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
              : getStep(filter.max_value, filter.min_value)
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

  const textRef = useRef(text);
  textRef.current = text;
  useEffect(() => {
    // If filter value changes elsewhere, set text here
    if (filter.value && filter.value !== textRef.current) setText(filter.value);
  }, [filter.value]);

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
      variant="outlined"
      size="small"
    />
  );
};

const BooleanFilterControls = ({
  column,
  filter,
  collectionId,
  context,
}: FilterControlProps & {
  filter: { type: 'bool' };
}) => {
  const dispatch = useAppDispatch();
  // Convert boolean values to proper dropdown values
  const getBooleanDropdownValue = (value?: number | boolean) => {
    if (value === true || value === 1) {
      return 'true';
    } else if (value === false || value === 0) {
      return 'false';
    } else {
      return 'any';
    }
  };
  const [selectValue, setSelectValue] = useState<string>(() => {
    return getBooleanDropdownValue(filter.value);
  });

  const handleChange = (event: SelectChangeEvent) => {
    setSelectValue(event.target.value as string);
  };

  // In order not to create a dependency loop when filter changes within the below effect,
  // use a filter ref
  const filterRef = useRef(filter);
  filterRef.current = filter;

  useEffect(() => {
    let value;
    if (selectValue === 'true') {
      value = 1;
    } else if (selectValue === 'false') {
      value = 0;
    }
    dispatch(
      setFilter([
        collectionId,
        context,
        column,
        { ...filterRef.current, value },
      ])
    );
  }, [selectValue, collectionId, context, column, dispatch]);

  useEffect(() => {
    //Clear when the filter is cleared
    // Use 'any' for empty value so the select stays controlled and shows "Any" in the dropdown
    if (filter.value === undefined || filter.value === null) {
      setSelectValue('any');
    } else if (filter.value !== filterRef.current.value) {
      setSelectValue(getBooleanDropdownValue(filter.value));
    }
  }, [filter.value, setSelectValue]);

  return (
    <FormControl fullWidth>
      <Select value={selectValue} onChange={handleChange}>
        <MenuItem value="true">True</MenuItem>
        <MenuItem value="false">False</MenuItem>
        <MenuItem value="any">Any</MenuItem>
      </Select>
    </FormControl>
  );
};
