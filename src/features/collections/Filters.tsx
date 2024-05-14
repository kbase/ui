/* eslint-disable @typescript-eslint/no-unused-vars */
import { Chip, Stack, Tab, Tabs } from '@mui/material';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  ColumnMeta,
  getBiologMeta,
  getGenomeAttribsMeta,
  getMicroTraitMeta,
  getSampleAttribsMeta,
} from '../../common/api/collectionsApi';
import { parseError } from '../../common/api/utils/parseError';
import { Loader } from '../../common/components';
import { useAppDispatch, useAppSelector } from '../../common/hooks';
import {
  clearFiltersAndColumnMeta,
  ContextTabsState,
  defaultFilterContext,
  FilterContext,
  FilterContextMode,
  FilterContextScope,
  setColumnMeta,
  setFilter,
  setFilterContext,
  setFilterContextTabs,
  useFilterContextState,
  useFilters,
} from './collectionsSlice';

export const FilterContextTabs = ({
  collectionId,
}: {
  collectionId: string;
}) => {
  const dispatch = useAppDispatch();
  const tabs = useAppSelector((state) => state.collections.contextTabs);
  const context = useFilterContextState(collectionId);
  useContextFilterQueryManagement(collectionId, context);

  const selectedTab = tabs && tabs.find((t) => t.value === context);

  if (!tabs) return <></>;

  return (
    <Tabs
      value={selectedTab?.value ?? tabs[0].value}
      onChange={(e, value) => {
        dispatch(setFilterContext([collectionId, value]));
      }}
      aria-label="basic tabs example"
    >
      {tabs.map((tab) => {
        return (
          <Tab
            key={tab.value}
            label={
              <Stack direction="row" alignItems={'center'} gap={1}>
                {tab.label}
                {tab.count !== undefined || tab.loading ? (
                  <Chip
                    size="small"
                    label={
                      tab.loading ? <Loader /> : tab.count?.toLocaleString()
                    }
                  />
                ) : (
                  <></>
                )}
              </Stack>
            }
            value={tab.value}
            disabled={!!tab.disabled}
          ></Tab>
        );
      })}
    </Tabs>
  );
};

/** Sets filter context tab options, if only a context string is provided, sets a fixed filter context*/
export const useFilterContexts = (
  collectionId: string,
  contexts:
    | FilterContext
    | [ContextTabsState & { disabled?: false }, ...ContextTabsState[]]
) => {
  const dispatch = useAppDispatch();
  const serialized = JSON.stringify(contexts);
  const context = useFilterContextState(collectionId, undefined);
  const contextRef = useRef(context);
  contextRef.current = context;

  useEffect(() => {
    const contexts = JSON.parse(serialized) as
      | FilterContext
      | ContextTabsState[];
    if (typeof contexts === 'string') {
      dispatch(setFilterContextTabs([collectionId, undefined]));
      dispatch(setFilterContext([collectionId, contexts]));
    } else {
      dispatch(setFilterContextTabs([collectionId, contexts]));
      if (
        contexts &&
        !contexts.find((c) => c.value === contextRef.current && !c.disabled)
      ) {
        dispatch(setFilterContext([collectionId, contexts[0].value]));
      }
    }
    return () => {
      dispatch(setFilterContextTabs([collectionId, undefined]));
    };
  }, [collectionId, dispatch, serialized]);
};

// Controls filter metadata queries for all possible contexts
export const useContextFilterQueryManagement = (
  collectionId: string | undefined,
  context: FilterContext = defaultFilterContext
) => {
  const dispatch = useAppDispatch();

  const { filters } = useFilters(collectionId);

  // create ref for filters, as we want to use them in effects non-dependently
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  // create a ref to store a mapping between requestID and triggering context
  const requestContext = useRef<Record<string, FilterContext>>({});

  // Define all our queries
  const [triggerGenome, genomeResult] = getGenomeAttribsMeta.useLazyQuery();
  const [triggerSample, sampleResult] = getSampleAttribsMeta.useLazyQuery();
  const [triggerMicrotrait, microtraitResult] =
    getMicroTraitMeta.useLazyQuery();
  const [triggerBiolog, biologResult] = getBiologMeta.useLazyQuery();

  const triggers = [
    triggerGenome,
    triggerSample,
    triggerMicrotrait,
    triggerBiolog,
  ];
  const results = [genomeResult, sampleResult, microtraitResult, biologResult];
  type CommonTriggerReturn = ReturnType<typeof triggers[number]>;
  type CommonResult = typeof results[number];

  const handleResult = useCallback(
    <T extends CommonResult>(
      result: T,
      collectionId: string | undefined
    ): { filterData?: T['data']; context?: FilterContext } => {
      if (result.isError) {
        const err = parseError(result.error);
        if (err.name !== 'AbortError')
          toast('Filter Loading failed: ' + parseError(result.error).message);
      }
      const context = result.requestId
        ? requestContext.current[result.requestId]
        : undefined;
      if (!collectionId || !result?.data || !context || result.isError)
        return {};
      return { filterData: result.data, context };
    },
    []
  );

  const handleTableFilters = useCallback(
    <T extends typeof genomeResult | typeof sampleResult>(result: T) => {
      const { filterData, context } = handleResult(result, collectionId);
      if (!filterData || !collectionId || !context) return;
      dispatch(clearFiltersAndColumnMeta([collectionId, context]));
      filterData.columns.forEach((column) => {
        const current = filtersRef.current && filtersRef.current[column.key];
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
    },
    [collectionId, dispatch, handleResult]
  );

  const handleHeatmapFilters = useCallback(
    <T extends typeof biologResult | typeof microtraitResult>(result: T) => {
      const { filterData, context } = handleResult(result, collectionId);
      if (!filterData || !collectionId || !context) return;
      dispatch(clearFiltersAndColumnMeta([collectionId, context]));
      filterData.categories.forEach((category) => {
        category.columns.forEach((column) => {
          const current =
            filtersRef.current && filtersRef.current[column.col_id];
          const filterMeta: ColumnMeta = {
            type: 'int',
            key: column.col_id,
            max_value: filterData.max_value,
            min_value: filterData.min_value,
            category: category.category,
            description: column.description,
            display_name: column.name,
            filter_strategy: undefined,
            enum_values: undefined,
          };
          dispatch(
            setColumnMeta([collectionId, context, column.col_id, filterMeta])
          );
          /**
           * Commenting out for restbecause this is throwing a typescript error
           */
          // dispatch(
          //   setFilter([
          //     collectionId,
          //     context,
          //     column.col_id,
          //     {
          //       type: filterMeta.type,
          //       min_value: filterMeta.min_value,
          //       max_value: filterMeta.max_value,
          //       value:
          //         current?.type === column.type ? current.value : undefined,
          //     },
          //   ])
          // );
        });
      });
    },
    [collectionId, dispatch, handleResult]
  );

  // When the context (or collection) changes, set the filter context and trigger appropriate query
  useEffect(() => {
    if (!collectionId) return;
    let request: CommonTriggerReturn | undefined;
    if (context === defaultFilterContext) {
      return;
    } else if ('genomes' === filterContextScope(context)) {
      request = triggerGenome({ collection_id: collectionId });
    } else if ('samples' === filterContextScope(context)) {
      request = triggerSample({ collection_id: collectionId });
    } else if ('microtrait' === filterContextScope(context)) {
      request = triggerMicrotrait({ collection_id: collectionId });
    } else if ('biolog' === filterContextScope(context)) {
      request = triggerBiolog({ collection_id: collectionId });
    } else {
      throw new Error(`No filter query matches filter context "${context}"`);
    }
    requestContext.current[request.requestId] = context;

    return () => {
      // Abort request if context changes while running (prevents race conditions)
      if (request) {
        request.abort();
      }
    };
  }, [
    context,
    collectionId,
    dispatch,
    triggerGenome,
    triggerSample,
    triggerMicrotrait,
    triggerBiolog,
  ]);

  // Trigger filter updates when queries complete
  useEffect(() => {
    // Genomes
    handleTableFilters(genomeResult);
  }, [genomeResult, handleTableFilters]);
  useEffect(() => {
    // Samples
    handleTableFilters(sampleResult);
  }, [handleTableFilters, sampleResult]);
  useEffect(() => {
    // Biolog
    handleHeatmapFilters(biologResult);
  }, [biologResult, handleHeatmapFilters]);
  useEffect(() => {
    // Microtrait
    handleHeatmapFilters(microtraitResult);
  }, [handleHeatmapFilters, microtraitResult]);

  return { filters, context };
};

export const filterContextScope = (
  context: FilterContext | undefined
): FilterContextScope | undefined => {
  return !context || context === 'none'
    ? undefined
    : (context.split('.')[0] as FilterContextScope);
};

export const filterContextMode = (
  context: FilterContext | undefined
): FilterContextMode | undefined => {
  return !context || context === 'none'
    ? undefined
    : (context.split('.')[1] as FilterContextMode);
};
