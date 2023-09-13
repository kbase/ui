import { FC } from 'react';
import { NarrativeDoc } from '../../../common/types/NarrativeDoc';

export interface ControlProps {
  narrativeDoc: NarrativeDoc;
  modalClose: () => void;
}

export const ErrorMessage: FC<{ err: unknown }> = ({ err }) => (
  <>
    <span>There was an error! Guru meditation:</span>
    <span>{JSON.stringify(err)}</span>
  </>
);
