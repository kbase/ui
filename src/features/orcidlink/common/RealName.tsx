import { ORCIDProfile } from '../../../common/api/orcidLinkCommon';
import PrivateField from './PrivateField';

export interface RealNameProps {
  profile: ORCIDProfile;
}

/**
 * Renders user's name from their ORCID profile.
 */
export default function RealName({ profile }: RealNameProps) {
  if (profile.nameGroup.private) {
    return <PrivateField />;
  }

  const { firstName, lastName } = profile.nameGroup.fields;
  if (lastName) {
    return (
      <span>
        {firstName} {lastName}
      </span>
    );
  }
  return <span>{firstName}</span>;
}
