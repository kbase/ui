import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Loader } from '../../../common/components/Loader';
import { NarrativeDoc } from '../../../common/types/NarrativeDoc';
import classes from './NarrativeList.module.scss';
import NarrativeViewItem from './NarrativeViewItem';

interface NarrativeListProps {
  hasMoreItems: boolean;
  items: NarrativeDoc[];
  itemsRemaining: number;
  loading: boolean;
  narrativeUPA: string | null;
  nextLimit: string;
  showVersionDropdown: boolean;
  sort?: string; // do we need it
}

export interface SelectItemEvent {
  upa?: string;
  idx: number;
}
function NarrativeList(props: NarrativeListProps) {
  const { items, loading, narrativeUPA, showVersionDropdown } = props;
  if (!items.length) {
    if (loading) {
      return (
        <div className={classes.narrative_list_loading_outer}>
          <div className={classes.narrative_list_loading_inner}>
            <FAIcon
              icon={faCog}
              spin={true}
              style={{ marginRight: '5px' }}
            ></FAIcon>
            <Loader type="spinner" />
          </div>
        </div>
      );
    }
    return (
      <div className={classes.narrative_list_loading_outer}>
        <p className={classes.narrative_list_loading_inner}>
          No results found.
        </p>
      </div>
    );
  }

  const hasMore = () => {
    const { itemsRemaining, hasMoreItems, loading, nextLimit } = props;
    if (!hasMoreItems) {
      return <span className={classes.list_footer}>No more results.</span>;
    }
    if (loading) {
      return (
        <span className={classes.list_footer}>
          <FAIcon
            icon={faCog}
            spin={true}
            style={{ marginRight: '5px' }}
          ></FAIcon>
          <Loader type="spinner" />
        </span>
      );
    }
    return (
      <Link
        className={`${classes.list_footer} ${classes.link_action}`}
        to={nextLimit}
      >
        Load more ({itemsRemaining} remaining)
      </Link>
    );
  };

  return (
    <>
      {items.map((item, idx) => {
        const selected = Boolean(
          narrativeUPA && narrativeUPA.startsWith(`${item.access_group}/`)
        );
        return (
          <NarrativeViewItem
            idx={idx}
            narrativeDoc={item}
            key={idx}
            showVersionDropdown={showVersionDropdown && selected}
          />
        );
      })}
      {hasMore()}
    </>
  );
}

export default NarrativeList;
