import { FC } from 'react';
import classes from './Navigator.module.scss';

/* NarrativeView should take (at least) a narrative upa as prop, but if it is
   null then it should show a message saying there is no narrative selected.
*/
const NarrativeView: FC<{
  view: string;
  narrative: string | null;
}> = ({ narrative, view }) => {
  return (
    <ul className={classes.details}>
      <li>narrative: {narrative}</li>
      <li>view: {view}</li>
    </ul>
  );
};

export default NarrativeView;
