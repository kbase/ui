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
import { useAppSelector } from '../../common/hooks';
import {
  Cell,
  isCodeCell,
  isKBaseAppCell,
  isKBaseCodeTypeCell,
  isKBaseDataCell,
  isMarkdownCell,
  MarkdownCell,
  NarrativeDoc,
} from '../../common/types/NarrativeDoc';
import AppCellIcon from '../../features/icons/AppCellIcon';
import TypeIcon from '../../features/icons/TypeIcon';
import {
  getParams,
  generatePathWithSearchParams,
} from '../../features/params/paramsSlice';
import NarrativeViewItem from './NarrativeList/NarrativeViewItem';
import { corruptCellError, narrativeURL, searchParams } from './common';
import { useCells } from './hooks';
import { cellsLoaded, narrativeDocsLookup, wsObjects } from './navigatorSlice';
import NarrativeControl from './NarrativeControl';
import NarrativeMetadata from './NarrativeMetadata';
import classes from './Navigator.module.scss';

const DOMPurify = createDOMPurify(window);
const sanitize = (markdown: string) =>
  DOMPurify.sanitize(marked(markdown), {
    ALLOWED_TAGS: [],
  });

const NarrativeVersionSelection: FC<{ narrativeDoc: NarrativeDoc }> = ({
  narrativeDoc,
}) => {
  return (
    <NarrativeViewItem
      activeOverride={true}
      idx={0}
      linkToNarrative={true}
      narrativeDoc={narrativeDoc}
      showVersionDropdown={true}
    />
  );
};

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
  const title =
    cell.metadata?.kbase?.attributes?.title || cell.source.split('\n')[0];
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
  index: number;
}> = ({ cell, index }) => {
  if (isMarkdownCell(cell)) {
    return <MarkdownCellCard cell={cell} />;
  }
  if (!isCodeCell(cell)) {
    // This will only happen in exceptional circumstances, e.g. a corrupted
    // narrative, so perhaps this should throw a more obnoxious error?
    corruptCellError(cell, index);
    return (
      <Card
        image={<DefaultIcon cellType={cell.cell_type} />}
        title={cell.source}
      />
    );
  }
  const kbaseData = cell.metadata.kbase;
  if (!kbaseData || !kbaseData.attributes) {
    corruptCellError(cell, index);
    return (
      <Card
        image={<DefaultIcon cellType={cell.cell_type} />}
        title={cell.source}
      />
    );
  }
  const title = kbaseData.attributes.title;
  const subtitle = kbaseData.attributes.subtitle;
  if (isKBaseAppCell(kbaseData)) {
    const app = kbaseData.appCell.app;
    const tag = app.tag;
    const icon = <AppCellIcon appId={app.id} appTag={tag} />;
    return <Card image={icon} title={title} subtitle={subtitle} />;
  }
  if (isKBaseDataCell(kbaseData)) {
    const objectInfo = kbaseData.dataCell.objectInfo;
    const objType = objectInfo.typeName;
    const icon = <TypeIcon objType={objType} />;
    return <Card image={icon} title={title} subtitle={subtitle} />;
  }
  const cellType = isKBaseCodeTypeCell(kbaseData)
    ? kbaseData.type
    : cell.cell_type;
  // eslint-disable-next-line no-console
  console.warn('Using default preview for', { cell, index });
  return (
    <Card
      image={<DefaultIcon cellType={cellType} />}
      title={title}
      subtitle={subtitle || cell.source}
    />
  );
};

const CellCardCollection: FC<{
  cellCards: JSX.Element[];
  extraCells: number;
}> = ({ cellCards, extraCells }) => (
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
);

interface NarrativePreviewProps {
  cells: Cell[];
  narrativeDoc: NarrativeDoc;
  wsId: number;
}
export const noPreviewMessage =
  'There is no preview available for this narrative.';
export const noWorkspaceCellsMessage =
  'No cells from the workspace can be previewed.';
export const NarrativePreview: FC<NarrativePreviewProps> = ({
  cells,
  narrativeDoc,
  wsId,
}) => {
  const limit = 16;
  const extraCells = Math.max(0, cells.length - limit);
  const cellCards = cells
    .slice(0, 16)
    .map((cell, ix) => <CellCard cell={cell} index={ix} key={ix} />);
  const NoPreviewAvailable: FC = () => {
    // eslint-disable-next-line no-console
    console.log(
      noWorkspaceCellsMessage,
      /* `There are ${narrativeDoc.cells.length} cached.`, */
      { wsId, cells, narrativeDoc }
    );
    return <>{noPreviewMessage}</>;
  };
  return (
    <section className={classes.preview}>
      {cells.length === 0 ? (
        <NoPreviewAvailable />
      ) : (
        <CellCardCollection cellCards={cellCards} extraCells={extraCells} />
      )}
      <a href={narrativeURL(wsId)}>View the full narrative.</a>
    </section>
  );
};

/* NarrativeView takes a narrative UPA and a view. */
const NarrativeView: FC<{
  narrativeUPA: string;
  view: string;
}> = ({ narrativeUPA, view }) => {
  const wsId = Number(narrativeUPA.split('/')[0]);
  /*
    We retreive the cells from the workspace to get details of the cell not
    stored in searchapi2. This does not always work because older narrative
    objects in the ws adhere to a different schema.
  */
  const cells = useCells({ narrativeUPA });
  const cellsLoadedStatus = useAppSelector(cellsLoaded) && Array.isArray(cells);
  const dataObjectsLookup = useAppSelector(wsObjects);
  const narrativeDocsFound = useAppSelector(narrativeDocsLookup);
  /* This narrativeDocFound is a NarrativeDoc from searchapi2 which is a
     distinct type from a narrative object from the workspace.
  */
  const narrativeDocFound = narrativeDocsFound[wsId];
  const NarrativeViewCurrent: FC = () => {
    return view === 'data' ? (
      <DataView wsId={wsId} dataObjects={dataObjectsLookup[wsId]} />
    ) : (
      <NarrativePreview
        cells={cells}
        narrativeDoc={narrativeDocFound}
        wsId={wsId}
      />
    );
  };
  return (
    <section className={classes.view}>
      {narrativeDocFound ? (
        <>
          <div>
            <div className={classes.control}>
              <NarrativeVersionSelection narrativeDoc={narrativeDocFound} />
              <NarrativeControl narrativeDoc={narrativeDocFound} />
            </div>
            <NarrativeMetadata cells={cells} narrativeDoc={narrativeDocFound} />
            <NarrativeViewTabs view={view} />
          </div>
          {cellsLoadedStatus ? <NarrativeViewCurrent /> : <>Loading...</>}
        </>
      ) : (
        <></>
      )}
    </section>
  );
};

export default NarrativeView;
