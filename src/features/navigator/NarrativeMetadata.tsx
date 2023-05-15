// <NarrativeMetadata />
import { FC } from 'react';
import { useAppSelector } from '../../common/hooks';
import {
  Cell,
  DataObject,
  isCodeCell,
  isKBaseAppCell,
  isKBaseCodeTypeCell,
  isKBaseDataCell,
  isMarkdownCell,
  NarrativeDoc,
} from '../../common/types/NarrativeDoc';
import { corruptCellError } from './common';
import { useUsers } from './hooks';
import { users } from './navigatorSlice';
import classes from './Navigator.module.scss';

const cellType = (cell: Cell, index: number) => {
  if (isMarkdownCell(cell)) {
    return 'markdown';
  }
  if (!isCodeCell(cell)) {
    corruptCellError(cell, index);
    return 'corrupt';
  }
  const kbaseData = cell.metadata.kbase;
  if (!kbaseData) {
    corruptCellError(cell, index);
    return 'corrupt';
  }
  if (isKBaseAppCell(kbaseData)) {
    return 'kbase_app';
  }
  if (isKBaseDataCell(kbaseData)) {
    return 'data';
  }
  if (isKBaseCodeTypeCell(kbaseData)) {
    return 'code_cell';
  }
  // Other cells are not counted.
  return 'other';
};

const countCellTypes = (cells: Cell[]) => {
  const defaults = {
    markdown: 0,
    code_cell: 0,
    data: 0,
    kbase_app: 0,
  };
  return cells.reduce(
    (acc: Record<string, number>, cell: Cell, index: number) => {
      acc[cellType(cell, index)] += 1;
      return acc;
    },
    defaults
  );
};

const readableDate = (date: string | number): string => {
  return new Date(date).toLocaleDateString();
};

export interface NarrativeMetadataProps {
  cells: Cell[];
  narrativeDoc: NarrativeDoc;
}

type NarrativeMetadataType = FC<NarrativeMetadataProps>;

const NarrativeMetadata: NarrativeMetadataType = ({ cells, narrativeDoc }) => {
  const { data_objects: dataObjects, shared_users: usersShared } = narrativeDoc;
  /* We need to filter because searchapi2 may have bad data, e.g. 67096/1/3 */
  const usersSharedFiltered = usersShared.filter((user) =>
    user.match(/^[0-9_a-z]*$/)
  );
  useUsers({ users: usersSharedFiltered });
  const usersLoaded = useAppSelector(users);
  const profileLink = (username: string) => (
    <a key={`${username}-link`} href={`/#user/${username}`} title={username}>
      {usersLoaded[username]}
    </a>
  );
  /* count cell types */
  const cellTypeCounts = countCellTypes(cells);
  /* count data object types */
  const normalize = (key: string) => {
    const begin = key.indexOf('.') + 1;
    const end = key.lastIndexOf('-');
    return key.slice(begin, end);
  };
  const sortCountDesc = (freq1: [string, number], freq2: [string, number]) => {
    const count1 = freq1[1];
    const count2 = freq2[1];
    return -1 + Number(count1 === count2) + 2 * Number(count1 < count2);
  };
  const dataTypeCounts: Record<string, number> = {};
  dataObjects.forEach((obj: DataObject) => {
    const key = normalize(obj.obj_type);
    if (!(key in dataTypeCounts)) {
      dataTypeCounts[key] = 0;
    }
    dataTypeCounts[key] = dataTypeCounts[key] + 1;
  });
  const dataPlaces = Object.entries(dataTypeCounts)
    .sort(sortCountDesc)
    .slice(0, 3);
  const dataTypesTop = dataPlaces.map(([dataType, count], ix) => {
    return (
      <li key={ix}>
        {dataType}: <span>{count}</span>
      </li>
    );
  });
  const usersSharedOther = usersSharedFiltered.filter(
    (user) => user !== narrativeDoc.creator
  );
  const usersMore = usersSharedOther.length > 10;
  const [finalLess, finalMore] = usersMore
    ? ['', classes.final]
    : [classes.final, ''];
  return (
    <div className={classes.metadata}>
      <div className={classes.columns}>
        <div className={classes.column}>
          <ul>
            <li>Author: {profileLink(narrativeDoc.creator)}</li>
            <li>Created on: {readableDate(narrativeDoc.creation_date)}</li>
            <li>Last saved: {readableDate(narrativeDoc.timestamp)}</li>
            <li>Visibility: {narrativeDoc.is_public ? 'Public' : 'Private'}</li>
          </ul>
        </div>
        <div className={classes.column}>
          <ul>
            <li>Data objects: {dataObjects.length}</li>
            {dataTypesTop}
          </ul>
        </div>
        <div className={classes.column}>
          <ul>
            <li>Total cells: {cells.length}</li>
            <li>App cells: {cellTypeCounts.kbase_app}</li>
            <li>Markdown cells: {cellTypeCounts.markdown}</li>
            <li>Code cells: {cellTypeCounts.code_cell}</li>
          </ul>
        </div>
      </div>
      <div>
        <span>Shared with:</span>
        <ul className={[finalLess, classes.shared].join(' ')}>
          {usersSharedOther.slice(0, 10).map((user, ix) => (
            <li key={ix}>{profileLink(user)}</li>
          ))}
        </ul>
        {usersMore ? (
          <>
            <input
              className={classes['shared-toggle']}
              id="shared-toggle"
              type="checkbox"
            />
            <ul className={[finalMore, classes.more, classes.shared].join(' ')}>
              {usersSharedOther.slice(10).map((user, ix) => (
                <li key={ix}>{profileLink(user)}</li>
              ))}
            </ul>
            <label className={classes.more} htmlFor="shared-toggle">
              ... Show {usersSharedOther.length - 10} more.
            </label>
            <label className={classes.less} htmlFor="shared-toggle">
              Show fewer.
            </label>
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default NarrativeMetadata;
