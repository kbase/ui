import { FC, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import * as timeago from 'timeago.js';
import { useAppSelector } from '../../../common/hooks';
import { NarrativeListDoc } from '../../../common/types/NarrativeDoc';
import {
  keepParamsForLocation,
  narrativePath,
  navigatorParams,
} from '../common';
import { categorySelected } from '../navigatorSlice';
import NarrativeItemDropdown from './NarrativeItemDropdown';
import classes from './NarrativeList.module.scss';

export interface NarrativeViewItemProps {
  idx: number;
  item: NarrativeListDoc;
  showVersionDropdown: boolean;
  onSelectItem?: (idx: number) => void;
  onUpaChange?: (upa: string) => void;
}

const NarrativeViewItem: FC<NarrativeViewItemProps> = ({
  idx,
  item,
  onUpaChange,
  showVersionDropdown,
}) => {
  const { access_group, creator, narrative_title, obj_id, timestamp, version } =
    item;
  const upa = `${access_group}/${obj_id}/${version}`;
  const { id, obj, ver } =
    useParams<{ id: string; obj: string; ver: string }>();
  const selectedAccessGroup = id ? id : null;
  const selectedObjId = obj ? obj : null;
  const selectedVersion = ver ? ver : null;
  const active =
    access_group.toString() === selectedAccessGroup &&
    obj_id.toString() === selectedObjId &&
    selectedVersion;
  const status = active ? 'active' : 'inactive';
  // Note: timeago expects milliseconds
  const timeElapsed = timeago.format(timestamp * 1000);
  const categorySet = useAppSelector(categorySelected);
  const loc = useLocation();
  const keepNavigatorParams = keepParamsForLocation({
    location: loc,
    params: navigatorParams,
  });
  // notify upa change once new narrative item is focused on
  useEffect(() => {
    if (active) {
      onUpaChange?.(upa);
    }
  }, [active, onUpaChange, upa]);

  function handleVersionSelect(version: number) {
    onUpaChange?.(`${access_group}/${obj_id}/${version}`);
  }

  const narrativeViewItemPath = (version: number) => {
    const categoryPath = categorySet !== 'own' ? categorySet : null;
    return keepNavigatorParams(
      narrativePath({
        id: access_group.toString(),
        obj: obj_id.toString(),
        categoryPath,
        ver: version.toString(),
      })
    );
  };

  const pathVersion = active ? +selectedVersion : version;
  const path = narrativeViewItemPath(pathVersion);
  return (
    <section key={idx}>
      <Link
        to={path}
        className={`${classes.narrative_item_outer} ${classes[status]}`}
      >
        <div className={classes.narrative_item_inner}>
          <div className={classes.narrative_item_text}>
            <div>{narrative_title || 'Untitiled'}</div>
            {showVersionDropdown && active ? (
              <NarrativeItemDropdown
                narrative={upa}
                version={pathVersion}
                onVersionSelect={(e) => handleVersionSelect(e)}
              />
            ) : (
              <div className={classes.dropdown_wrapper}></div>
            )}
          </div>
          <div className={classes.narrative_item_details}>
            Updated {timeElapsed} by {creator}
          </div>
        </div>
      </Link>
    </section>
  );
};

export default NarrativeViewItem;
