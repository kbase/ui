import { usePageTitle } from '../layout/layoutSlice';

export default function Status() {
  usePageTitle('KBase Europa UI Status');
  return (
    <section>
      <h2>Current Version / Commit SHA</h2>
      <p>
        <code>{import.meta.env.VITE_COMMIT}</code>
      </p>
    </section>
  );
}
