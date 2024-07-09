import { ORCID_ICON_URL } from '../constants';
import styles from './ORCIDIdLink.module.scss';

export interface ORCIDIdLinkProps {
  url: string;
  orcidId: string;
}

/**
 * Renders an anchor link to an ORCID profile in the form recommended by ORCID.
 *
 */
export function ORCIDIdLink({ url, orcidId }: ORCIDIdLinkProps) {
  return (
    <a
      href={`${url}/${orcidId}`}
      target="_blank"
      rel="noreferrer"
      className={styles.main}
    >
      <img src={ORCID_ICON_URL} alt="ORCID Icon" className={styles.icon} />
      {url}/{orcidId}
    </a>
  );
}
