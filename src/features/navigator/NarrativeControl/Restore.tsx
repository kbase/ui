/* NarrativeControl/Restore */
import { FC } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { restoreNarrative } from '../../../common/api/narrativeService';
import { isKBaseBaseQueryError } from '../../../common/api/utils/common';
import { parseError } from '../../../common/api/utils/parseError';
import { Button } from '../../../common/components';
import { useAppDispatch, useAppSelector } from '../../../common/hooks';
import { NarrativeDoc } from '../../../common/types/NarrativeDoc';
import { getParams } from '../../../features/params/paramsSlice';
import { generateNavigatorPath } from '../common';
import { categorySelected } from '../navigatorSlice';
import { ErrorMessage } from './common';
import {
  restoreNarrative as restoreAction,
  setLoading,
} from '../navigatorSlice';

export const Restore: FC<{
  modalClose: () => void;
  narrativeDoc: NarrativeDoc;
  version: number;
}> = ({ modalClose, narrativeDoc, version }) => {
  /* hooks */
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const categorySet = useAppSelector(categorySelected);
  const params = useAppSelector(getParams);
  const [restoreTrigger] = restoreNarrative.useMutation();
  /* derived values */
  const categoryPath = categorySet !== 'own' ? categorySet : '';
  const { access_group: wsId, obj_id: objId } = narrativeDoc;
  const message = `Restored version ${version} of object ${objId} in ${wsId}.`;
  /* restore narrative callback */
  const restoreHandler = async () => {
    modalClose();
    dispatch(restoreAction({ objId, version, wsId }));
    try {
      await restoreTrigger({ objId, version, wsId }).unwrap();
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
    navigate(
      generateNavigatorPath({
        id: wsId.toString(),
        obj: objId.toString(),
        ver: version.toString(),
        categoryPath,
        ...params,
      })
    );
  };
  /* Restore component */
  return (
    <>
      <p>
        Reverting a narrative will create a new version identical to
        {` v${version}`}.
      </p>

      <p>
        This new narrative can be reverted to an earlier version at any time.
      </p>

      <p>Do you wish to continue?</p>

      <div>
        <Button onClick={restoreHandler}>Revert</Button>
        <Button onClick={modalClose}>Cancel</Button>
      </div>
    </>
  );
};
