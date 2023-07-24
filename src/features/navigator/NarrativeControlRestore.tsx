/* NarrativeControlRestore */
import { FC } from 'react';
import { Button } from '../../common/components';
import { useAppDispatch } from '../../common/hooks';
import { NarrativeDoc } from '../../common/types/NarrativeDoc';
import { restoreNarrative } from './navigatorSlice';

export const Restore: FC<{
  modalClose: () => void;
  narrativeDoc: NarrativeDoc;
  version: number;
}> = ({ modalClose, narrativeDoc, version }) => {
  const dispatch = useAppDispatch();
  const wsId = narrativeDoc.access_group;
  const restoreHandler = async () => {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(dispatch(restoreNarrative({ version, wsId })));
      }, 1000);
    });
    modalClose();
  };

  return (
    <>
      <p>
        Reverting a narrative will create a new version identical to
        {`v${narrativeDoc.version}`}.
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
