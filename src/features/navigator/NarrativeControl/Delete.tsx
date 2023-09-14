/* NarrativeControl/Delete */
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../../common/components';
import { useAppDispatch, useAppSelector } from '../../../common/hooks';
import { isKBaseBaseQueryError } from '../../../common/api/utils/common';
import { parseError } from '../../../common/api/utils/parseError';
import { deleteWorkspace } from '../../../common/api/workspaceApi';
import {
  generatePathWithSearchParams,
  getParams,
} from '../../../features/params/paramsSlice';
import { deleteNarrative, loading, setLoading } from '../navigatorSlice';
import { ControlProps, ErrorMessage } from './common';

export const Delete: FC<ControlProps> = ({ narrativeDoc, modalClose }) => {
  /* hooks */
  const dispatch = useAppDispatch();
  const loadState = useAppSelector(loading);
  const params = useAppSelector(getParams);
  const navigate = useNavigate();
  const [userConfirmation, setUserConfirmation] = useState(false);
  const [deleteTrigger] = deleteWorkspace.useMutation();
  useEffect(() => {
    if (loadState) return;
    if (!userConfirmation) return;
  });

  /* derived values */
  const wsId = narrativeDoc.access_group;
  const message = `Deleted narrative ${wsId}.`;

  /* delete narrative callback */
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
  /* Delete component */
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
