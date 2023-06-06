import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { FC } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as timeago from 'timeago.js';
import { useAppSelector } from '../../../common/hooks';
import { NarrativeDoc } from '../../../common/types/NarrativeDoc';
import { getParams } from '../../../features/params/paramsSlice';
import {
  generateNavigatorPath,
  narrativeURL,
  navigatorParams,
  normalizeVersion,
} from '../common';
import { categorySelected } from '../navigatorSlice';
import NarrativeItemDropdown from './NarrativeItemDropdown';
import classes from './NarrativeList.module.scss';

export interface NarrativeViewItemProps {
  idx: number;
  narrativeDoc: NarrativeDoc;
  showVersionDropdown: boolean;
  activeOverride?: boolean;
  linkToNarrative?: boolean;
}

const NarrativeViewItem: FC<NarrativeViewItemProps> = ({
  activeOverride,
  idx,
  linkToNarrative,
  narrativeDoc,
  showVersionDropdown,
}) => {
  const categorySet = useAppSelector(categorySelected);
  const europaParams = useAppSelector(getParams);
  const { id, obj, ver: verRaw } = useParams();
  const { access_group, creator, narrative_title, obj_id, timestamp, version } =
    narrativeDoc;
  const ver = Math.min(Number(normalizeVersion(verRaw)), version);
  const wsId = access_group.toString();
  const upa = `${wsId}/${obj_id}/${version}`;
  const active = wsId === id && obj_id.toString() === obj;
  const status = active ? 'active' : 'inactive';
  // Note: timeago expects milliseconds
  const timeElapsed = timeago.format(timestamp);

  const navigatorParamsCurrent = Object.fromEntries(
    navigatorParams.map((param) => [param, europaParams[param]])
  );
  const narrativeViewItemPath = (version: number) => {
    const categoryPath = categorySet !== 'own' ? categorySet : '';
    return generateNavigatorPath({
      categoryPath,
      extraParams: navigatorParamsCurrent,
      id: wsId,
      obj: obj_id.toString(),
      ver: version.toString(),
    });
  };

  const pathVersion = active ? ver : version;
  const path = linkToNarrative
    ? narrativeURL(wsId)
    : narrativeViewItemPath(pathVersion);
  const titleClass = linkToNarrative ? classes.title : '';
  return (
    <section className={titleClass} key={idx}>
      {linkToNarrative ? <FAIcon icon={faArrowUpRightFromSquare} /> : <></>}
      <Link
        to={path}
        className={`${classes.narrative_item_outer} ${classes[status]}`}
        target={linkToNarrative ? '_blank' : ''}
      >
        <div className={classes.narrative_item_inner}>
          <div className={classes.narrative_item_text}>
            <div>{narrative_title}</div>
            <NarrativeItemDropdown
              narrativeUPA={upa}
              visible={showVersionDropdown}
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
