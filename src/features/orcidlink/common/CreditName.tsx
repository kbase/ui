import { Typography } from '@mui/material';
import { ORCIDProfile } from '../../../common/api/orcidLinkCommon';
import NA from './NA';
import PrivateField from './PrivateField';

export interface CreditNameProps {
  profile: ORCIDProfile;
}

/**
 * Displays an ORCID user profile "published name" - an optional name a user may
 * specify in their ORCID profile to be used in publication credit, instead of
 * their given (required) and family names (optiona).
 */
export default function CreditName({ profile }: CreditNameProps) {
  if (profile.nameGroup.private) {
    return <PrivateField />;
  }
  if (!profile.nameGroup.fields.creditName) {
    return <NA />;
  }
  return <Typography>{profile.nameGroup.fields.creditName}</Typography>;
}
