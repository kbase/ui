import { useAppDispatch, useAppSelector, useBackoff } from '../../common/hooks';
import { useEffect } from 'react';
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import {
  setPendingSelectionId,
  setServerSelection,
  setUserSelection,
} from './collectionsSlice';
import { createSelection, getSelection } from '../../common/api/collectionsApi';

export const SelectionPane = ({ collectionId }: { collectionId: string }) => {
  const dispatch = useAppDispatch();

  const selection = useAppSelector((state) => state.collections.selection);
  useSyncSelection(collectionId);

  return (
    <>
      <h3>
        Selection Options{' '}
        {selection.pendingId ? <FAIcon icon={faSpinner} spin /> : undefined}
      </h3>
      <ul>
        <li>
          Your current selection includes {selection.current.length} items.
        </li>
        <li>Selection ID: {selection.id}</li>
        <li>Selection: {[...selection.current].join(', ')}</li>
      </ul>
      <button onClick={() => dispatch(setUserSelection({ selection: [] }))}>
        Clear Selection
      </button>
    </>
  );
};

const useSyncSelection = (collectionId: string) => {
  const dispatch = useAppDispatch();
  const selection = useAppSelector((state) => state.collections.selection);

  useEffect(() => {
    // clear selection when the collection changes
    dispatch(setUserSelection({ selection: [] }));
  }, [collectionId, dispatch]);

  // selection creation
  const [createSelectionMutation, createSelectionResult] =
    createSelection.useMutation();

  useEffect(() => {
    // create a new server-side collection when a user has an unsaved collection in state
    if (!selection.id && !selection.pendingId && selection.current.length > 0) {
      createSelectionMutation({
        collection_id: collectionId,
        selection_ids: selection.current,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection.id, selection.pendingId, selection.current]);

  useEffect(() => {
    // created ID gets stored as pending (so we can check it still matches the current selection)
    dispatch(setPendingSelectionId(createSelectionResult.data?.selection_id));
  }, [createSelectionResult.data?.selection_id, dispatch]);

  // get/poll selection using pending ID
  const backoff = useBackoff();
  const getSelectionQuery = getSelection.useQuery(
    { selection_id: selection.pendingId || '' },
    {
      skip: !selection.pendingId,
      pollingInterval: backoff.duration,
    }
  );

  useEffect(
    () => backoff.increment(),
    [getSelectionQuery.startedTimeStamp, backoff]
  );

  useEffect(() => {
    // reset when pending selection ID changes, don't poll if there isn't a pending selection id
    backoff.reset();
    backoff.toggle(!!selection.pendingId);
  }, [backoff, selection.pendingId]);

  useEffect(() => {
    // end polling on error or when processing is done
    if (
      !getSelectionQuery.isFetching &&
      (getSelectionQuery.isError ||
        (getSelectionQuery.data &&
          getSelectionQuery.data.state !== 'processing'))
    )
      backoff.toggle(false);
  }, [
    backoff,
    getSelectionQuery.isFetching,
    getSelectionQuery.isError,
    getSelectionQuery.data,
  ]);

  useEffect(() => {
    // dispatch saved selection or console.error depending on poll result
    if (!getSelectionQuery.isFetching) {
      if (
        getSelectionQuery.data &&
        getSelectionQuery.data.state === 'complete'
      ) {
        dispatch(
          setServerSelection({
            id: getSelectionQuery.data.selection_id,
            selection: getSelectionQuery.data.selection_ids,
          })
        );
        if (selection.pendingId === getSelectionQuery.data.selection_id) {
          dispatch(setPendingSelectionId(undefined));
        }
      } else if (
        getSelectionQuery.error ||
        getSelectionQuery.data?.state === 'failed'
      ) {
        // eslint-disable-next-line no-console
        console.error(
          'An error occurred fetching a selection',
          getSelectionQuery.data,
          getSelectionQuery.error,
          createSelectionResult.data,
          createSelectionResult.error
        );
      }
    }
  }, [
    createSelectionResult.data,
    createSelectionResult.error,
    dispatch,
    getSelectionQuery.data,
    getSelectionQuery.error,
    getSelectionQuery.isFetching,
    selection.pendingId,
  ]);
};
