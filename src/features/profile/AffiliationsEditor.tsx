import {
  faCheck,
  faPlus,
  faTrash,
  faX,
} from '@fortawesome/free-solid-svg-icons';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { FC, useState } from 'react';
import { Affiliation } from './profileTypes';

interface AffiliationsEditorProps {
  affiliations: Affiliation[];
  onChange: (affiliations: Affiliation[]) => void;
  disabled?: boolean;
}

const currentYear = new Date().getFullYear();

const emptyAffiliation: Affiliation = {
  title: '',
  organization: '',
  started: currentYear,
  ended: null,
};

interface AffiliationFormState {
  title: string;
  organization: string;
  started: string;
  ended: string;
  present: boolean;
}

const toFormState = (a: Affiliation): AffiliationFormState => ({
  title: a.title,
  organization: a.organization,
  started: String(a.started),
  ended: a.ended !== null ? String(a.ended) : '',
  present: a.ended === null,
});

const toAffiliation = (f: AffiliationFormState): Affiliation => ({
  title: f.title,
  organization: f.organization,
  started: parseInt(f.started, 10) || currentYear,
  ended: f.present ? null : parseInt(f.ended, 10) || currentYear,
});

const isFormValid = (f: AffiliationFormState): boolean => {
  if (!f.title.trim() || !f.organization.trim()) return false;
  const started = parseInt(f.started, 10);
  if (isNaN(started) || started < 1900 || started > currentYear) return false;
  if (!f.present) {
    const ended = parseInt(f.ended, 10);
    if (isNaN(ended) || ended < 1900 || ended > currentYear) return false;
    if (started > ended) return false;
  }
  return true;
};

export const AffiliationsEditor: FC<AffiliationsEditorProps> = ({
  affiliations,
  onChange,
  disabled,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<AffiliationFormState>(
    toFormState(emptyAffiliation)
  );

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setAdding(false);
    setForm(toFormState(affiliations[index]));
  };

  const startAdd = () => {
    setAdding(true);
    setEditingIndex(null);
    setForm(toFormState(emptyAffiliation));
  };

  const cancel = () => {
    setEditingIndex(null);
    setAdding(false);
  };

  const saveEdit = () => {
    if (!isFormValid(form)) return;
    const updated = [...affiliations];
    if (editingIndex !== null) {
      updated[editingIndex] = toAffiliation(form);
    }
    onChange(updated);
    cancel();
  };

  const saveAdd = () => {
    if (!isFormValid(form)) return;
    onChange([...affiliations, toAffiliation(form)]);
    cancel();
  };

  const deleteRow = (index: number) => {
    onChange(affiliations.filter((_, i) => i !== index));
    if (editingIndex === index) cancel();
  };

  const updateForm = (field: keyof AffiliationFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const renderFormRow = (onSave: () => void) => (
    <TableRow>
      <TableCell>
        <TextField
          size="small"
          value={form.title}
          onChange={(e) => updateForm('title', e.target.value)}
          placeholder="Position"
        />
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          value={form.organization}
          onChange={(e) => updateForm('organization', e.target.value)}
          placeholder="Organization"
        />
      </TableCell>
      <TableCell>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              type="number"
              value={form.started}
              onChange={(e) => updateForm('started', e.target.value)}
              inputProps={{ min: 1900, max: currentYear }}
              sx={{ width: 90 }}
              placeholder="Start"
            />
            <Typography>-</Typography>
            {form.present ? (
              <Typography>Present</Typography>
            ) : (
              <TextField
                size="small"
                type="number"
                value={form.ended}
                onChange={(e) => updateForm('ended', e.target.value)}
                inputProps={{ min: 1900, max: currentYear }}
                sx={{ width: 90 }}
                placeholder="End"
              />
            )}
          </Stack>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={form.present}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    present: e.target.checked,
                    ended: e.target.checked ? '' : String(currentYear),
                  }))
                }
              />
            }
            label="Present"
          />
        </Stack>
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            onClick={onSave}
            disabled={!isFormValid(form)}
            color="primary"
          >
            <FontAwesomeIcon icon={faCheck} />
          </IconButton>
          <IconButton size="small" onClick={cancel}>
            <FontAwesomeIcon icon={faX} />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
  );

  return (
    <Stack spacing={1}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Position</TableCell>
            <TableCell>Organization</TableCell>
            <TableCell>Tenure</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {affiliations.map((aff, index) =>
            editingIndex === index ? (
              renderFormRow(saveEdit)
            ) : (
              <TableRow key={`${aff.title}-${aff.organization}-${index}`}>
                <TableCell>{aff.title}</TableCell>
                <TableCell>{aff.organization}</TableCell>
                <TableCell>
                  {aff.started} - {aff.ended ?? 'Present'}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      size="small"
                      onClick={() => startEdit(index)}
                      disabled={disabled || adding}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => deleteRow(index)}
                      disabled={disabled || adding}
                      color="error"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            )
          )}
          {adding && renderFormRow(saveAdd)}
          {affiliations.length === 0 && !adding && (
            <TableRow>
              <TableCell colSpan={4}>
                <Typography color="text.secondary">No affiliations</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {!adding && editingIndex === null && (
        <div>
          <Button
            size="small"
            startIcon={<FontAwesomeIcon icon={faPlus} />}
            onClick={startAdd}
            disabled={disabled}
          >
            Add Affiliation
          </Button>
        </div>
      )}
    </Stack>
  );
};
