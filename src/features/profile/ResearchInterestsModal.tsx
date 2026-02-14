import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Stack,
  TextField,
} from '@mui/material';
import { FC, useState } from 'react';
import { RESEARCH_INTERESTS } from './profileConstants';

interface ResearchInterestsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (selected: string[], other: string | null) => void;
  initialSelected: string[];
  initialOther: string | null;
}

export const ResearchInterestsModal: FC<ResearchInterestsModalProps> = ({
  open,
  onClose,
  onSave,
  initialSelected,
  initialOther,
}) => {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [otherText, setOtherText] = useState(initialOther ?? '');
  const otherChecked = selected.includes('Other');

  const toggleInterest = (interest: string) => {
    setSelected((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Research Interests</DialogTitle>
      <DialogContent>
        <FormGroup>
          {RESEARCH_INTERESTS.filter((i) => i !== 'Other').map((interest) => (
            <FormControlLabel
              key={interest}
              control={
                <Checkbox
                  checked={selected.includes(interest)}
                  onChange={() => toggleInterest(interest)}
                />
              }
              label={interest}
            />
          ))}
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={otherChecked}
                  onChange={() => toggleInterest('Other')}
                />
              }
              label="Other"
            />
            {otherChecked && (
              <TextField
                size="small"
                placeholder="Describe your research interest"
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                sx={{ ml: 4 }}
              />
            )}
          </Stack>
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => onSave(selected, otherChecked ? otherText : null)}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
