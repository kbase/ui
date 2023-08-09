import { NarrativeDoc } from '../../../common/types/NarrativeDoc';

export interface ControlProps {
  narrativeDoc: NarrativeDoc;
  modalClose: () => void;
}
