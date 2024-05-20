import { image } from '../images';
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
      <img src={image('orcidIcon')} alt="ORCID Icon" className={styles.icon} />
      {url}/{orcidId}
    </a>
  );
}
