import { LinkRecordPublic } from '../../../common/api/orcidlinkAPI';
import styles from '../orcidlink.module.scss';

export interface LinkedProps {
  linkRecord: LinkRecordPublic;
}

export default function Linked({ linkRecord }: LinkedProps) {
  const {
    username,
    orcid_auth: { orcid, name },
  } = linkRecord;
  return (
    <div>
      <p>Congratulations! You do indeed have an ORCID Link</p>
      <div className={styles['prop-table']}>
        <div>
          <div>Username</div>
          <div>{username}</div>
        </div>
        <div>
          <div>ORCID Id</div>
          <div>{orcid}</div>
        </div>
        <div>
          <div>Name at ORCID</div>
          <div>{name}</div>
        </div>
      </div>
    </div>
  );
}
