import { testDataObjects } from '../../common/components/DataView.fixture';
import {
  CodeCell,
  MarkdownCell,
  NarrativeDoc,
} from '../../common/types/NarrativeDoc';
import { AppTag } from '../../features/icons/iconSlice';

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

export const testCells: (MarkdownCell | CodeCell)[] = [
  {
    // markdown cell
    cell_type: 'markdown',
    metadata: {
      kbase: {
        attributes: {
          title: 'A markdown cell.',
        },
      },
    },
    source: '# A markdown cell',
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
  ...testApps.map((app) =>
    appCellFactory({
      id: app,
      tag: AppTag.release,
      title: app,
      subtitle: `An app cell for ${app}`,
    })
  ),
];

export const testNarrative: NarrativeDoc = {
  access_group: 0,
  cells: testCells,
  copied: null,
  creation_date: '',
  creator: '',
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
  shared_users: [],
  tags: [],
  timestamp: 0,
  total_cells: 0,
  version: 0,
};
