import Linked from '../Linked';
import Unlinked from '../Unlinked';
import styles from '../orcidlink.module.scss';

export interface HomeProps {
  isLinked: boolean;
}

export default function Home({ isLinked }: HomeProps) {
  if (isLinked) {
    return (
      <div className={styles.box}>
        <Linked />
      </div>
    );
  }
  return (
    <div className={styles.box}>
      <Unlinked />
    </div>
  );
}
