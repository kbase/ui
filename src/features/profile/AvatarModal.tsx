import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { FC, useState } from 'react';
import { Select } from '../../common/components/Select';
import { AVATAR_OPTIONS, GRAVATAR_DEFAULTS } from './profileConstants';

interface AvatarModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (avatarOption: string, gravatarDefault: string) => void;
  gravatarHash: string;
  initialAvatarOption: string;
  initialGravatarDefault: string;
}

export const AvatarModal: FC<AvatarModalProps> = ({
  open,
  onClose,
  onSave,
  gravatarHash,
  initialAvatarOption,
  initialGravatarDefault,
}) => {
  const [avatarOption, setAvatarOption] = useState(initialAvatarOption);
  const [gravatarDefault, setGravatarDefault] = useState(
    initialGravatarDefault
  );

  const previewSrc =
    avatarOption === 'gravatar' && gravatarHash
      ? `https://www.gravatar.com/avatar/${gravatarHash}?s=200&r=pg&d=${gravatarDefault}`
      : '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Avatar Settings</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <FormControl>
            <FormLabel>Avatar Source</FormLabel>
            <RadioGroup
              value={avatarOption}
              onChange={(e) => setAvatarOption(e.target.value)}
            >
              {AVATAR_OPTIONS.map((opt) => (
                <FormControlLabel
                  key={String(opt.value)}
                  value={opt.value}
                  control={<Radio />}
                  label={String(opt.label)}
                />
              ))}
            </RadioGroup>
          </FormControl>
          {avatarOption === 'gravatar' && (
            <>
              <FormControl>
                <FormLabel sx={{ mb: 1 }}>Default Gravatar Image</FormLabel>
                <Select
                  options={GRAVATAR_DEFAULTS}
                  value={
                    GRAVATAR_DEFAULTS.find(
                      (o) => o.value === gravatarDefault
                    ) ?? null
                  }
                  onChange={(opts) => {
                    if (opts[0]) {
                      setGravatarDefault(String(opts[0].value));
                    }
                  }}
                />
              </FormControl>
              {previewSrc && (
                <Stack alignItems="center" spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Preview
                  </Typography>
                  <img
                    src={previewSrc}
                    alt="Gravatar preview"
                    style={{
                      width: 200,
                      height: 200,
                      borderRadius: 4,
                    }}
                  />
                </Stack>
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => onSave(avatarOption, gravatarDefault)}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
