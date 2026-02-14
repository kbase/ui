import { faCheck, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { setUserProfile } from '../../common/api/userProfileApi';
import { Loader } from '../../common/components/Loader';
import { Select } from '../../common/components/Select';
import { useAppSelector } from '../../common/hooks';
import { AffiliationsEditor } from './AffiliationsEditor';
import { AvatarModal } from './AvatarModal';
import {
  COUNTRIES,
  FUNDING_SOURCES,
  INSTITUTIONS,
  JOB_TITLES,
  US_STATES,
} from './profileConstants';
import { Affiliation, ProfileData, UserData } from './profileTypes';
import { ResearchInterestsModal } from './ResearchInterestsModal';
import classes from './Profile.module.scss';

interface ProfileEditFormProps {
  profileData: ProfileData;
  username: string;
  realname: string;
  onCancel: () => void;
  onSaved: () => void;
}

interface ProfileFormData {
  jobTitle: string;
  jobTitleOther: string;
  department: string;
  organization: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  fundingSource: string;
  researchStatement: string;
}

export const ProfileEditForm: FC<ProfileEditFormProps> = ({
  profileData,
  username,
  realname,
  onCancel,
  onSaved,
}) => {
  const token = useAppSelector(({ auth }) => auth.token ?? '');
  const [triggerSetProfile, setProfileResult] = setUserProfile.useMutation();

  const form = useForm<ProfileFormData>({
    values: {
      jobTitle: profileData?.userdata?.jobTitle ?? '',
      jobTitleOther: profileData?.userdata?.jobTitleOther ?? '',
      department: profileData?.userdata?.department ?? '',
      organization: profileData?.userdata?.organization ?? '',
      country: profileData?.userdata?.country ?? '',
      state: profileData?.userdata?.state ?? '',
      city: profileData?.userdata?.city ?? '',
      postalCode: profileData?.userdata?.postalCode ?? '',
      fundingSource: profileData?.userdata?.fundingSource ?? '',
      researchStatement: profileData?.userdata?.researchStatement ?? '',
    },
    mode: 'onChange',
  });

  // State for complex fields managed outside react-hook-form
  const [researchInterests, setResearchInterests] = useState<string[]>(
    profileData?.userdata?.researchInterests ?? []
  );
  const [researchInterestsOther, setResearchInterestsOther] = useState<
    string | null
  >(profileData?.userdata?.researchInterestsOther ?? null);
  const [affiliations, setAffiliations] = useState<Affiliation[]>(
    profileData?.userdata?.affiliations ?? []
  );
  const [avatarOption, setAvatarOption] = useState(
    profileData?.userdata?.avatarOption ?? 'gravatar'
  );
  const [gravatarDefault, setGravatarDefault] = useState(
    profileData?.userdata?.gravatarDefault ?? 'identicon'
  );

  // Modal state
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [interestsModalOpen, setInterestsModalOpen] = useState(false);

  const gravatarHash = profileData?.synced?.gravatarHash ?? '';
  const avatarSrc =
    avatarOption === 'gravatar' && gravatarHash
      ? `https://www.gravatar.com/avatar/${gravatarHash}?s=300&r=pg&d=${gravatarDefault}`
      : '';

  const watchedJobTitle = form.watch('jobTitle');
  const watchedCountry = form.watch('country');
  const watchedResearchStatement = form.watch('researchStatement');

  const onSubmit = form.handleSubmit(
    async (formData) => {
      const updatedUserdata: UserData = {
        ...((profileData?.userdata ?? {}) as UserData),
        jobTitle: formData.jobTitle,
        jobTitleOther: formData.jobTitleOther,
        department: formData.department,
        organization: formData.organization,
        country: formData.country,
        state: formData.country === 'United States' ? formData.state : '',
        city: formData.city,
        postalCode: formData.postalCode,
        fundingSource: formData.fundingSource,
        researchStatement: formData.researchStatement,
        researchInterests,
        researchInterestsOther,
        affiliations,
        avatarOption,
        gravatarDefault,
      };

      await triggerSetProfile([
        {
          profile: {
            user: { username, realname },
            profile: {
              ...profileData,
              userdata: updatedUserdata,
            },
          },
        },
        token,
      ]);
      toast.success('Profile saved');
      onSaved();
    },
    (errors) => {
      const firstErr = Object.values(errors).filter(Boolean)?.[0];
      toast(firstErr?.message ?? 'Please fix the errors before saving');
    }
  );

  const onReset = () => {
    setProfileResult.reset();
    form.reset();
    setResearchInterests(profileData?.userdata?.researchInterests ?? []);
    setResearchInterestsOther(
      profileData?.userdata?.researchInterestsOther ?? null
    );
    setAffiliations(profileData?.userdata?.affiliations ?? []);
    setAvatarOption(profileData?.userdata?.avatarOption ?? 'gravatar');
    setGravatarDefault(profileData?.userdata?.gravatarDefault ?? 'identicon');
  };

  const save = {
    loading: setProfileResult.isLoading,
    complete: setProfileResult.isSuccess && !setProfileResult.isUninitialized,
    error: setProfileResult.isError,
  };

  return (
    <form onSubmit={onSubmit}>
      <Grid container spacing={2}>
        <Grid item md={3}>
          <Stack spacing={2}>
            <Paper>
              <Stack spacing={1}>
                <img src={avatarSrc} alt={`Profile avatar for ${realname}`} />
                <Stack className={classes['profile-names']}>
                  <Typography variant="h2">{realname}</Typography>
                  <Typography variant="h5">{username}</Typography>
                </Stack>
              </Stack>
            </Paper>
            <Button variant="outlined" onClick={() => setAvatarModalOpen(true)}>
              Edit Avatar
            </Button>
            <Paper className={classes['profile-panel']}>
              <Stack spacing={2}>
                <TextField
                  select
                  label="Job Title"
                  value={watchedJobTitle}
                  onChange={(e) =>
                    form.setValue('jobTitle', e.target.value, {
                      shouldValidate: true,
                    })
                  }
                  size="small"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {JOB_TITLES.map((jt) => (
                    <MenuItem key={String(jt.value)} value={String(jt.value)}>
                      {jt.label}
                    </MenuItem>
                  ))}
                </TextField>
                {watchedJobTitle === 'Other' && (
                  <TextField
                    label="Custom Job Title"
                    size="small"
                    {...form.register('jobTitleOther')}
                  />
                )}
                <TextField
                  label="Department"
                  size="small"
                  inputProps={{ maxLength: 50 }}
                  {...form.register('department')}
                />
                <Select
                  options={INSTITUTIONS}
                  value={
                    form.watch('organization')
                      ? {
                          label: form.watch('organization'),
                          value: form.watch('organization'),
                        }
                      : null
                  }
                  onChange={(opts) => {
                    form.setValue(
                      'organization',
                      (opts[0]?.value as string) ?? '',
                      { shouldValidate: true }
                    );
                  }}
                  placeholder="Organization..."
                />
                <Select
                  options={COUNTRIES}
                  value={
                    watchedCountry
                      ? {
                          label: watchedCountry,
                          value: watchedCountry,
                        }
                      : null
                  }
                  onChange={(opts) => {
                    form.setValue('country', (opts[0]?.value as string) ?? '', {
                      shouldValidate: true,
                    });
                  }}
                  placeholder="Country..."
                />
                {watchedCountry === 'United States' && (
                  <TextField
                    select
                    label="State"
                    value={form.watch('state')}
                    onChange={(e) =>
                      form.setValue('state', e.target.value, {
                        shouldValidate: true,
                      })
                    }
                    size="small"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {US_STATES.map((st) => (
                      <MenuItem key={String(st.value)} value={String(st.value)}>
                        {st.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
                <TextField
                  label="City"
                  size="small"
                  inputProps={{ maxLength: 85 }}
                  {...form.register('city')}
                />
                <TextField
                  label="Postal Code"
                  size="small"
                  {...form.register('postalCode')}
                />
                <Select
                  options={FUNDING_SOURCES}
                  value={
                    form.watch('fundingSource')
                      ? {
                          label: form.watch('fundingSource'),
                          value: form.watch('fundingSource'),
                        }
                      : null
                  }
                  onChange={(opts) => {
                    form.setValue(
                      'fundingSource',
                      (opts[0]?.value as string) ?? '',
                      { shouldValidate: true }
                    );
                  }}
                  placeholder="Funding Source..."
                />
              </Stack>
            </Paper>
          </Stack>
        </Grid>
        <Grid item md={9}>
          <Paper className={classes['profile-panel']}>
            <Stack spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h5" fontWeight="bold">
                  Research or Personal Statement
                </Typography>
                <TextField
                  multiline
                  rows={6}
                  inputProps={{ maxLength: 1000 }}
                  helperText={`${watchedResearchStatement?.length ?? 0}/1000`}
                  {...form.register('researchStatement')}
                />
              </Stack>
              <Stack spacing={1}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h5" fontWeight="bold">
                    Research Interests
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setInterestsModalOpen(true)}
                  >
                    Edit
                  </Button>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
                  {researchInterests.length === 0 && (
                    <Typography color="text.secondary">
                      None selected
                    </Typography>
                  )}
                  {researchInterests.map((interest) => (
                    <Chip key={interest} label={interest} />
                  ))}
                  {researchInterestsOther && (
                    <Chip label={researchInterestsOther} />
                  )}
                </Stack>
              </Stack>
              <Stack spacing={1}>
                <Typography variant="h5" fontWeight="bold">
                  Affiliations
                </Typography>
                <AffiliationsEditor
                  affiliations={affiliations}
                  onChange={setAffiliations}
                  disabled={save.loading}
                />
              </Stack>
              <Stack spacing={1} direction="row">
                <Button
                  variant="outlined"
                  color="base"
                  size="large"
                  onClick={() => {
                    onReset();
                    onCancel();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="outlined"
                  color="base"
                  size="large"
                  onClick={onReset}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant={!form.formState.isValid ? 'outlined' : 'contained'}
                  size="large"
                  endIcon={
                    save.loading ? (
                      <Loader loading={true} type="spinner" />
                    ) : save.complete ? (
                      <FontAwesomeIcon icon={faCheck} />
                    ) : save.error ? (
                      <FontAwesomeIcon icon={faX} />
                    ) : undefined
                  }
                >
                  Save
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      <AvatarModal
        open={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        onSave={(opt, def) => {
          setAvatarOption(opt);
          setGravatarDefault(def);
          setAvatarModalOpen(false);
        }}
        gravatarHash={gravatarHash}
        initialAvatarOption={avatarOption}
        initialGravatarDefault={gravatarDefault}
      />
      <ResearchInterestsModal
        open={interestsModalOpen}
        onClose={() => setInterestsModalOpen(false)}
        onSave={(selected, other) => {
          setResearchInterests(selected);
          setResearchInterestsOther(other);
          setInterestsModalOpen(false);
        }}
        initialSelected={researchInterests}
        initialOther={researchInterestsOther}
      />
    </form>
  );
};
