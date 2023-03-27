import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import {
  faCode,
  faCube,
  faDatabase,
  faParagraph,
  faWrench,
} from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import createDOMPurify from 'dompurify';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import { marked } from 'marked';
import { Card, CardList } from '../../common/components/Card';
import DataView from '../../common/components/DataView';
import { testDataObjects } from '../../common/components/DataView.fixture';
import { PlaceholderFactory } from '../../common/components/PlaceholderFactory';
import { useAppSelector } from '../../common/hooks';
import {
  Cell,
  isCodeCell,
  isKBaseAppCell,
  isKBaseCodeTypeCell,
  isKBaseDataCell,
  isMarkdownCell,
  MarkdownCell,
} from '../../common/types/NarrativeDoc';
import AppCellIcon from '../../features/icons/AppCellIcon';
import TypeIcon from '../../features/icons/TypeIcon';
import {
  getParams,
  generatePathWithSearchParams,
} from '../../features/params/paramsSlice';
import { searchParams } from './common';
import { testNarrative } from './NarrativeView.fixture';
import classes from './Navigator.module.scss';

const DOMPurify = createDOMPurify(window);
const sanitize = (markdown: string) =>
  DOMPurify.sanitize(marked(markdown), {
    ALLOWED_TAGS: [],
  });

const NarrativeControlMenu = PlaceholderFactory('NarrativeVersionControlMenu');
const NarrativeMetadata = PlaceholderFactory('NarrativeMetadata');
const NarrativeVersionSelection = PlaceholderFactory(
  'NarrativeVersionSelection'
);

const NarrativeViewTabs: FC<{
  view: string;
}> = ({ view }) => {
  const europaParams = useAppSelector(getParams);
  const searchParamsCurrent = Object.fromEntries(
    searchParams.map((param) => [param, europaParams[param]])
  );
  const tabTo = (view: string) =>
    generatePathWithSearchParams('', {
      ...searchParamsCurrent,
      view,
    });
  return (
    <ul>
      <li>
        <Link to={tabTo('data')}>Data</Link>
      </li>
      <li>
        <Link to={tabTo('preview')}>Preview</Link>
      </li>
    </ul>
  );
};

const DefaultIcon: FC<{ cellType: string }> = ({ cellType }) => {
  const icons: Record<string, IconProp> = {
    app: faCube,
    code: faCode,
    data: faDatabase,
    markdown: faParagraph,
    output: faWrench,
  };
  const icon = Object.hasOwn(icons, cellType)
    ? icons[cellType]
    : icons['output'];
  return <FAIcon icon={icon} />;
};

const MarkdownCellCard: FC<{ cell: MarkdownCell }> = ({ cell }) => {
  const title = cell.metadata.kbase.attributes.title;
  let subtitleRaw = cell.source;
  if (subtitleRaw.startsWith(title)) {
    subtitleRaw = subtitleRaw.slice(title.length);
  }
  const subtitle = sanitize(subtitleRaw);
  return (
    <Card
      image={<DefaultIcon cellType={cell.cell_type} />}
      subtitle={subtitle}
      title={sanitize(title)}
    />
  );
};

const CellCard: FC<{
  cell: Cell;
}> = ({ cell }) => {
  if (isMarkdownCell(cell)) {
    return <MarkdownCellCard cell={cell} />;
  }
  if (!isCodeCell(cell)) {
    // This will only happen in exceptional circumstances, e.g. a corrupted
    // narrative, so perhaps this should throw a more obnoxious error?
    return (
      <Card
        image={<DefaultIcon cellType={cell.cell_type} />}
        title={cell.source}
      />
    );
  }
  const kbase = cell.metadata.kbase;
  const title = kbase.attributes.title;
  const subtitle = kbase.attributes.subtitle;
  if (isKBaseAppCell(kbase)) {
    const app = kbase.appCell.app;
    const tag = app.tag;
    const icon = <AppCellIcon appId={app.id} appTag={tag} />;
    return <Card image={icon} title={title} subtitle={subtitle} />;
  }
  if (isKBaseDataCell(kbase)) {
    const objectInfo = kbase.dataCell.objectInfo;
    const objType = objectInfo.typeName;
    const icon = <TypeIcon objType={objType} />;
    return <Card image={icon} title={title} subtitle={subtitle} />;
  }
  const cellType = isKBaseCodeTypeCell(kbase) ? kbase.type : cell.cell_type;
  return (
    <Card
      image={<DefaultIcon cellType={cellType} />}
      title={title}
      subtitle={subtitle || cell.source}
    />
  );
};

interface NarrativePreviewProps {
  wsId: number;
  cells: Cell[];
}

export const NarrativePreview: FC<NarrativePreviewProps> = ({
  wsId,
  cells,
}) => {
  const limit = 16;
  const extraCells = Math.max(0, cells.length - limit);
  const cellCards = cells
    .slice(0, 16)
    .map((cell, ix) => <CellCard cell={cell} key={ix} />);
  return (
    <section className={classes.preview}>
      <ul>
        <li>
          <CardList>{cellCards}</CardList>
        </li>
        {extraCells > 0 ? (
          <li>
            + {extraCells} more cell{extraCells === 1 ? '' : 's'}.
          </li>
        ) : (
          <></>
        )}
      </ul>
      <a href={`https://ci.kbase.us/narrative/${wsId}`}>
        View the full narrative.
      </a>
    </section>
  );
};

/* NarrativeView should take (at least) a narrative upa as prop, but if it is
   null then it should show a message saying there is no narrative selected.
*/
const NarrativeView: FC<{
  view: string;
  narrativeUPA: string;
}> = ({ narrativeUPA, view }) => {
  const wsId = +narrativeUPA.split('/')[0];
  //const narrative = useNarrative({ narrativeUPA });
  const narrative = testNarrative;
  return (
    <>
      <section className={classes.view}>
        <div>
          <div className={classes.control}>
            <NarrativeVersionSelection narrativeUPA={narrativeUPA} />
            <NarrativeControlMenu narrativeUPA={narrativeUPA} />
          </div>
          <NarrativeMetadata narrativeUPA={narrativeUPA} />
          <NarrativeViewTabs view={view} />
        </div>
        {view === 'data' ? (
          <DataView wsId={wsId} dataObjects={testDataObjects} />
        ) : (
          <NarrativePreview wsId={wsId} cells={narrative.cells} />
        )}
      </section>
    </>
  );
};

export default NarrativeView;
