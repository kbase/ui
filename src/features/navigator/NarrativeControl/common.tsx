import { NarrativeDoc } from '../../../common/types/NarrativeDoc';

export interface ControlProps {
  narrativeDoc: NarrativeDoc;
  modalClose: () => void;
}

export const ErrorMessage = ({ err }: { err: unknown }): JSX.Element => (
  <>
    <span>There was an error! Guru meditation:</span>
    <span>{JSON.stringify(err)}</span>
  </>
);
