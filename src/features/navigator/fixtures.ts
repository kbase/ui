import { MockParams } from 'jest-fetch-mock';
import { usernameRequested } from '../common';
import { testDataObjects } from '../../common/components/DataView.fixture';
import {
  Cell,
  CodeCell,
  MarkdownCell,
  NarrativeDoc,
} from '../../common/types/NarrativeDoc';
import { AppTag } from '../../features/icons/iconSlice';
import narrativeTestDocs from './fixture.NarrativeTestDocs.json';
import { Category } from './common';

export type NarrativeTestDoc = Pick<
  NarrativeDoc,
  | 'access_group'
  | 'creator'
  | 'narrative_title'
  | 'obj_id'
  | 'timestamp'
  | 'version'
>;

export const factoryNarrativeDoc = (
  partial: NarrativeTestDoc
): NarrativeDoc => {
  return {
    cells: [],
    copied: null,
    creation_date: partial.timestamp.toString(),
    data_objects: [],
    is_narratorial: false,
    is_public: false,
    is_temporary: false,
    modified_at: partial.timestamp,
    obj_name: 'obj_name',
    obj_type_module: 'KBaseType',
    obj_type_version: '1',
    owner: partial.creator,
    shared_users: [partial.creator],
    tags: [],
    total_cells: 0,
    ...partial,
  };
};

const appCellFactory = ({
  id,
  tag,
  title,
  subtitle,
}: {
  id: string;
  tag: AppTag;
  title: string;
  subtitle: string;
}): CodeCell => ({
  // app cell
  cell_type: 'code',
  metadata: {
    kbase: {
      appCell: {
        app: {
          id,
          tag,
        },
      },
      attributes: {
        title,
        subtitle,
      },
      type: 'app',
    },
  },
  source: '# some python\nimport this',
});

const testApps = [
  'kb_uploadmethods/import_fasta_as_assembly_from_staging',
  'refseq_importer',
  'kb_uploadmethods/import_gff_fasta_as_genome_from_staging',
  'sample_uploader/import_samples',
  'KEConnectorGenomeHomology.run',
  'RAST_SDK/reannotate_microbial_genome',
  'MEGAHIT/run_megahit',
  'genome_transform.genbank_to_genome',
  'RAST_SDK/annotate_contigset',
  'GenomeFileUtil/import_genome_gbk_file',
  'hipmer/run_hipmer_hpc',
] as const;

export const testCells: (MarkdownCell | CodeCell)[] = [
  {
    // markdown cell
    cell_type: 'markdown',
    metadata: {
      kbase: {
        attributes: {
          title: '# A markdown cell.',
        },
      },
    },
    source: '# A markdown cell.\n## A wonderful markdown subtitle.',
  },
  {
    // app cell
    cell_type: 'code',
    metadata: {
      kbase: {
        appCell: {
          app: {
            id: 'NarrativeTest/app_succeed',
            tag: AppTag.dev,
          },
        },
        attributes: {
          title: 'An app cell.',
          subtitle: 'A really great app.',
        },
        type: 'app',
      },
    },
    source: '# some python\nimport this',
  },
  {
    // data cell
    cell_type: 'code',
    metadata: {
      kbase: {
        attributes: {
          title: 'A data cell.',
          subtitle: 'Some great data.',
        },
        dataCell: {
          objectInfo: {
            type: 'KBaseSets.ReadsSet-1.3',
            typeName: 'ReadsSet',
          },
        },
        type: 'data',
      },
    },
    source: '# some python\nimport this',
  },
  {
    // output cell
    cell_type: 'code',
    metadata: {
      kbase: {
        attributes: {
          title: 'A cool output cell title',
        },
        type: 'output',
      },
    },
    source: 'from biokbase.narrative.widgetmanager import WidgetManager...',
  },
  {
    // editor cell
    cell_type: 'code',
    metadata: {
      kbase: {
        attributes: {
          title: 'A cool editor cell title',
          subtitle: 'A cool editor cell subtitle',
        },
        type: 'editor',
      },
    },
    source: 'from biokbase.narrative.widgetmanager import WidgetManager...',
  },
  {
    // code cell
    cell_type: 'code',
    metadata: {
      kbase: {
        attributes: {
          title: 'A cool code cell title',
          subtitle: 'python',
        },
        type: 'code',
      },
    },
    source: '# A cool code cell title\nimport this',
  },
  {
    // another markdown cell
    cell_type: 'markdown',
    metadata: {
      kbase: {
        attributes: {
          title: 'A title.',
        },
      },
    },
    source: 'A different title!',
  },
  {
    // Not implemented: a cell type not counted in <NarrativeMetadata />
    cell_type: 'code',
    metadata: {
      kbase: {
        attributes: {
          title: 'A cell that thinks different.',
        },
      },
    },
    source: '# some python\nimport this',
  },
  {
    // Old: kbase key does not exist in metadata attribute.
    cell_type: 'markdown',
    // @ts-expect-error No kbase key.
    metadata: {},
    source: `Welcome to KBase's Narrative Interface!\nWhat's a Narrative?`,
  },
  {
    // Corrupt: cell_type is not markdown or code.
    // @ts-expect-error A corrupted cell.
    cell_type: 'corrupt',
    source: 'corrupted',
  },
  {
    // Corrupt: kbase key does not exist in metadata attribute.
    cell_type: 'code',
    // @ts-expect-error No kbase key.
    metadata: {},
    source: 'corrupted',
  },
  ...testApps.map((app) =>
    appCellFactory({
      id: app,
      tag: AppTag.release,
      title: app,
      subtitle: `An app cell for ${app}`,
    })
  ),
];

export const testNarrativeDoc: NarrativeDoc = {
  access_group: 1,
  cells: testCells,
  copied: null,
  creation_date: '',
  creator: usernameRequested,
  data_objects: testDataObjects,
  is_narratorial: true,
  is_public: true,
  is_temporary: true,
  modified_at: 0,
  narrative_title: '',
  obj_id: 0,
  obj_name: '',
  obj_type_module: '',
  obj_type_version: '',
  owner: '',
  shared_users: [usernameRequested],
  tags: [],
  timestamp: 0,
  total_cells: testCells.length,
  version: 0,
};

export const testItems: NarrativeDoc[] = narrativeTestDocs
  .map((partial) => factoryNarrativeDoc(partial))
  .concat(testNarrativeDoc);

export const testNarrativeDocsLookup = Object.fromEntries(
  testItems.map((narrative) => [narrative.access_group, narrative])
);

export const initialTestStateFactory = ({
  cells = [],
  cellsLoaded = false,
}: {
  cells?: Cell[];
  cellsLoaded?: boolean;
}) => ({
  category: Category['own'],
  controlMenu: {
    linkedOrgs: [],
    shares: {},
    sharesCount: 0,
  },
  count: testItems.length,
  narrativeDocs: testItems,
  narrativeDocsLookup: testNarrativeDocsLookup,
  search_time: 0,
  selected: null,
  users: {},
  wsObjects: [],
  cells,
  cellsLoaded,
});

export const initialTestState = initialTestStateFactory({});

export const testResponseOKFactory = (
  narrativeDoc: NarrativeDoc
): [string, MockParams] => [
  JSON.stringify({
    jsonrpc: '2.0',
    result: [{ data: [{ data: narrativeDoc }] }],
  }),
  { status: 200 },
];
