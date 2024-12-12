import { Button, Stack } from '@mui/material';
import { Box } from '@mui/system';
import classes from './providers.module.scss';
import orcidLogo from '../../common/assets/orcid.png';
import globusLogo from '../../common/assets/globus.png';
import googleLogo from '../../common/assets/google.webp';

export const providers = [
  {
    name: 'ORCID',
    icon: (
      <img src={orcidLogo} alt="ORCID logo" className={classes['sso-logo']} />
    ),
  },
  {
    name: 'Google',
    icon: (
      <img src={googleLogo} alt="Google logo" className={classes['sso-logo']} />
    ),
  },
  {
    name: 'Globus',
    icon: (
      <img src={globusLogo} alt="Globus logo" className={classes['sso-logo']} />
    ),
  },
];

export const ProviderButtons = ({
  text,
}: {
  text: (provider: string) => string;
}) => {
  const [orcidProvider, ...otherProviders] = providers;

  return (
    <Stack spacing={2}>
      <Button
        name="provider"
        value={orcidProvider.name}
        type="submit"
        variant="outlined"
        color="base"
        size="large"
        startIcon={orcidProvider.icon}
        data-testid="loginORCID"
      >
        {text(orcidProvider.name)}
      </Button>
      <Box className={classes['separator']} />
      <Stack spacing={1}>
        {otherProviders.map((provider) => (
          <Button
            key={provider.name}
            name="provider"
            value={provider.name}
            type="submit"
            variant="outlined"
            color="base"
            size="large"
            startIcon={provider.icon}
          >
            {text(provider.name)}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
};
