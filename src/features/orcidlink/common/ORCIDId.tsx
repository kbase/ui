/**
 * A simple component to display an anchor link to an ORCID profile in the form recommended by ORCID.
 *
 */
import { ORCID_ICON_URL } from '../constants';
import styles from './ORCIDId.module.scss';

export interface ORCIDIdProps {
  orcidId: string;
}

export default function ORCIDId({ orcidId }: ORCIDIdProps) {
  return (
    <span className={styles.main}>
      <img src={ORCID_ICON_URL} alt="ORCID Icon" className={styles.icon} />
      {orcidId}
    </span>
  );
}
