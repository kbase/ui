import { FC } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as timeago from 'timeago.js';
import { useAppSelector } from '../../../common/hooks';
import { NarrativeListDoc } from '../../../common/types/NarrativeDoc';
import { getParams } from '../../../features/params/paramsSlice';
import { narrativePath, navigatorParams } from '../common';
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
  const {
    id = null,
    obj = null,
    ver = null,
  } = useParams<{ id: string; obj: string; ver: string }>();
  const active =
    access_group.toString() === id && obj_id.toString() === obj && ver;
  const status = active ? 'active' : 'inactive';
  // Note: timeago expects milliseconds
  const timeElapsed = timeago.format(timestamp);
  const categorySet = useAppSelector(categorySelected);
  const europaParams = useAppSelector(getParams);

  function handleVersionSelect(version: number) {
    onUpaChange?.(`${access_group}/${obj_id}/${version}`);
  }

  const navigatorParamsCurrent = Object.fromEntries(
    navigatorParams.map((param) => [param, europaParams[param]])
  );
  const narrativeViewItemPath = (version: number) => {
    const categoryPath = categorySet !== 'own' ? categorySet : null;
    return narrativePath({
      categoryPath,
      extraParams: navigatorParamsCurrent,
      id: access_group.toString(),
      obj: obj_id.toString(),
      ver: version.toString(),
    });
  };

  const pathVersion = active ? +ver : version;
  const path = narrativeViewItemPath(pathVersion);
  return (
    <section key={idx}>
      <Link
        to={path}
        className={`${classes.narrative_item_outer} ${classes[status]}`}
      >
        <div className={classes.narrative_item_inner}>
          <div className={classes.narrative_item_text}>
            <div>{narrative_title}</div>
            <NarrativeItemDropdown
              narrative={upa}
              onVersionSelect={(e) => handleVersionSelect(e)}
              visible={Boolean(showVersionDropdown && active)}
              version={pathVersion}
            />
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
