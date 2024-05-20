/**
 * The entrypoint to the root of the ORCID Link UI.
 *
 * Its primary responsibility is to branch to a view for a linked user or an
 * unlinked user.
 */
import { InfoResult } from '../../../common/api/orcidlinkAPI';
import HomeLinked from '../HomeLinked';
import HomeUnlinked from '../HomeUnlinked';

export interface HomeProps {
  isLinked: boolean;
  info: InfoResult;
}

export default function Home({ isLinked, info }: HomeProps) {
  if (isLinked) {
    return <HomeLinked info={info} />;
  }
  return <HomeUnlinked />;
}
