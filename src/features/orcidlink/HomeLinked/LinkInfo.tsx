import {
  LinkRecordPublic,
  ORCIDProfile,
} from '../../../common/api/orcidLinkCommon';
import {
  renderCreditName,
  renderORCIDIcon,
  renderRealname,
} from '../common/misc';
import Scopes from '../common/Scopes';
import styles from '../orcidlink.module.scss';

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
  function renderORCIDId() {
    return (
      <a
        href={`${orcidSiteURL}/${linkRecord.orcid_auth.orcid}`}
        target="_blank"
        rel="noreferrer"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {renderORCIDIcon()}
        {orcidSiteURL}/{linkRecord.orcid_auth.orcid}
      </a>
    );
  }

  return (
    <div>
      <div className={styles['prop-table']}>
        <div>
          <div>ORCID iD</div>
          <div>{renderORCIDId()}</div>
        </div>
        <div>
          <div>Name on Account</div>
          <div>{renderRealname(profile)}</div>
        </div>
        <div>
          <div>Published Name</div>
          <div>{renderCreditName(profile)}</div>
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