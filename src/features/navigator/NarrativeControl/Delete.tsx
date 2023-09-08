/* NarrativeControl/Delete */
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../../common/components';
import { useAppDispatch, useAppSelector } from '../../../common/hooks';
import { isKBaseBaseQueryError } from '../../../common/api/utils/kbaseBaseQuery';
import { parseError } from '../../../common/api/utils/parseError';
import { deleteWorkspace } from '../../../common/api/workspaceApi';
import {
  generatePathWithSearchParams,
  getParams,
} from '../../../features/params/paramsSlice';
import { deleteNarrative, loading, setLoading } from '../navigatorSlice';
import { ControlProps } from './common';

const ErrorMessage: FC<{ err: unknown }> = ({ err }) => (
  <>
    <span>There was an error! Guru meditation:</span>
    <span>{JSON.stringify(err)}</span>
  </>
);

export const Delete: FC<ControlProps> = ({ narrativeDoc, modalClose }) => {
  const dispatch = useAppDispatch();
  const loadState = useAppSelector(loading);
  const params = useAppSelector(getParams);
  const navigate = useNavigate();
  const [userConfirmation, setUserConfirmation] = useState(false);
  const [deleteTrigger] = deleteWorkspace.useMutation();

  const wsId = narrativeDoc.access_group;
  useEffect(() => {
    if (loadState) return;
    if (!userConfirmation) return;
  });

  const message = `Deleted narrative ${wsId}.`;
  const deleteNarrativeHandler = async () => {
    setUserConfirmation(true);
    modalClose();
    dispatch(deleteNarrative({ wsId }));
    try {
      await deleteTrigger({ wsId }).unwrap();
      dispatch(setLoading(false));
    } catch (err) {
      if (!isKBaseBaseQueryError(err)) {
        console.error({ err }); // eslint-disable-line no-console
        toast(ErrorMessage({ err }));
        return;
      }
      toast(ErrorMessage({ err: parseError(err) }));
      dispatch(setLoading(false));
      return;
    }
    toast(message);
    navigate(generatePathWithSearchParams('/narratives', params));
  };
  return (
    <>
      <p>Delete Narrative?</p>
      <p>Deleting a Narrative will permanently remove it and all its data.</p>
      <p>This action cannot be undone!</p>
      <p>Continue?</p>
      <div>
        <Button disabled={loadState} onClick={deleteNarrativeHandler}>
          Delete
        </Button>
        <Button onClick={modalClose}>Cancel</Button>
      </div>
    </>
  );
};
