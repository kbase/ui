/**
 * Displays basic information about an orcid link from a user's orcidlink public
 * record, and orcid profile.
 *
 */
import {
  LinkRecordPublic,
  ORCIDProfile,
} from '../../../common/api/orcidLinkCommon';
import CreditName from './CreditName';
import styles from './LinkInfo.module.scss';
import { ORCIDIdLink } from './ORCIDIdLink';
import RealName from './RealName';
import Scopes from './Scopes';

export interface LinkInfoProps {
  linkRecord: LinkRecordPublic;
  profile: ORCIDProfile;
  orcidSiteURL: string;
}

export default function LinkInfo({
  linkRecord,
  profile,
  orcidSiteURL,
}: LinkInfoProps) {
  return (
    <div>
      <div className={styles.info_table}>
        <div>
          <div>ORCID iD</div>
          <div>
            <ORCIDIdLink
              url={orcidSiteURL}
              orcidId={linkRecord.orcid_auth.orcid}
            />
          </div>
        </div>
        <div>
          <div>Name on Account</div>
          <div>
            <RealName profile={profile} />
          </div>
        </div>
        <div>
          <div>Published Name</div>
          <div>
            <CreditName profile={profile} />
          </div>
        </div>
        <div>
          <div>Created on</div>
          <div>
            {Intl.DateTimeFormat('en-US', { dateStyle: 'short' }).format(
              linkRecord.created_at
            )}
          </div>
        </div>
        <div>
          <div>Expires on</div>
          <div>
            {Intl.DateTimeFormat('en-US', { dateStyle: 'short' }).format(
              linkRecord.expires_at
            )}
          </div>
        </div>
        <div>
          <div>Permissions Granted</div>
          <div>
            <Scopes scopes={linkRecord.orcid_auth.scope} />
          </div>
        </div>
      </div>
    </div>
  );
}
