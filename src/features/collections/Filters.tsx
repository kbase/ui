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
import { useAppDispatch } from '../../common/hooks';
import {
  clearFiltersAndColumnMeta,
  defaultFilterContext,
  FilterContext,
  setColumnMeta,
  setFilter,
  setFilterContext,
  useFilters,
} from './collectionsSlice';

export const useContextFilters = (
  collectionId: string | undefined,
  context: FilterContext = defaultFilterContext
) => {
  const dispatch = useAppDispatch();

  const { filters } = useFilters(collectionId);

  // create ref for filters, as we want to use them in effects non-dependently
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

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

  const handleErrors = useCallback(
    <T extends CommonResult>(
      result: T,
      collectionId: string | undefined
    ): T['data'] | undefined => {
      if (result.isError) {
        toast('Filter Loading failed: ' + parseError(result.error).message);
      }
      if (!collectionId || !result?.data) return;
      return result.data;
    },
    []
  );

  const handleTableFilters = useCallback(
    <T extends typeof genomeResult | typeof sampleResult>(result: T) => {
      const filterData = handleErrors(result, collectionId);
      if (!filterData || !collectionId) return;
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
    [collectionId, context, dispatch, handleErrors]
  );

  const handleHeatmapFilters = useCallback(
    <T extends typeof biologResult | typeof microtraitResult>(result: T) => {
      const filterData = handleErrors(result, collectionId);
      if (!filterData || !collectionId) return;
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
          dispatch(
            setFilter([
              collectionId,
              context,
              column.col_id,
              {
                type: filterMeta.type,
                min_value: filterMeta.min_value,
                max_value: filterMeta.max_value,
                value:
                  current?.type === column.type ? current.value : undefined,
              },
            ])
          );
        });
      });
    },
    [collectionId, context, dispatch, handleErrors]
  );

  // When the context (or collection) changes, set the filter context and trigger appropriate query
  useEffect(() => {
    if (!collectionId) return;
    dispatch(setFilterContext([collectionId, context]));
    let filterQueryTriggered: CommonTriggerReturn | undefined;
    if (context.startsWith('genomes.') || context === defaultFilterContext) {
      filterQueryTriggered = triggerGenome({ collection_id: collectionId });
    } else if (context.startsWith('samples.')) {
      filterQueryTriggered = triggerSample({ collection_id: collectionId });
    } else if (context.startsWith('microtrait.')) {
      filterQueryTriggered = triggerMicrotrait({ collection_id: collectionId });
    } else if (context.startsWith('biolog.')) {
      filterQueryTriggered = triggerBiolog({ collection_id: collectionId });
    } else {
      throw new Error(`No filter query matches filter context "${context}"`);
    }

    return () => {
      // Abort request if context changes while running (prevents race conditions)
      if (filterQueryTriggered) {
        filterQueryTriggered.abort();
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
