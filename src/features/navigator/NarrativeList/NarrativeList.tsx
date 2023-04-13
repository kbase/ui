import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
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
  onLoadMoreItems?: () => void;
  sort?: string; // do we need it
}

export interface SelectItemEvent {
  upa?: string;
  idx: number;
}
function NarrativeList(props: NarrativeListProps) {
  if (!props.items.length) {
    if (props.loading) {
      return (
        <div className={classes.narrative_list_loading_outer}>
          <div className={classes.narrative_list_loading_inner}>
            <FAIcon
              icon={faCog}
              spin={true}
              style={{ marginRight: '5px' }}
            ></FAIcon>
            Loading...
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

  function hasMoreButton() {
    const {
      itemsRemaining,
      hasMoreItems,
      loading,
      onLoadMoreItems,
      nextLimit,
    } = props;
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
          Loading...
        </span>
      );
    }
    return (
      <Link
        className={`${classes.list_footer} ${classes.link_action}`}
        onClick={onLoadMoreItems}
        to={nextLimit}
      >
        Load more ({itemsRemaining} remaining)
      </Link>
    );
  }

  return (
    <>
      {props.items.map((item, idx) => {
        return (
          <NarrativeViewItem
            idx={idx}
            item={item}
            key={idx}
            onUpaChange={
              (upa) => console.log(upa) /* eslint-disable-line no-console */
            }
            showVersionDropdown={props.showVersionDropdown}
          />
        );
      })}
      {hasMoreButton()}
    </>
  );
}

export default NarrativeList;
