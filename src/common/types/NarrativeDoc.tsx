import { AppTag } from '../../features/icons/iconSlice';

interface KBaseCell {
  attributes: {
    subtitle?: string;
    title: string;
  };
}

interface KBaseCodeTypeCell extends KBaseCell {
  type: string;
}

interface KBaseAppCell extends KBaseCodeTypeCell {
  appCell: {
    app: {
      id: string;
      tag: AppTag;
    };
  };
  type: 'app';
}

interface KBaseCodeCell extends KBaseCodeTypeCell {
  type: 'code';
}

interface KBaseDataCell extends KBaseCodeTypeCell {
  dataCell: {
    objectInfo: {
      type: string;
      typeName: string;
    };
  };
  type: 'data';
}

interface KBaseEditorCell extends KBaseCodeTypeCell {
  type: 'editor';
}

interface KBaseOutputCell extends KBaseCodeTypeCell {
  type: 'output';
}

export interface Cell {
  cell_type: 'code' | 'markdown';
  source: string;
}

export interface CodeCell extends Cell {
  cell_type: 'code';
  metadata: {
    kbase:
      | KBaseAppCell
      | KBaseCell
      | KBaseCodeCell
      | KBaseDataCell
      | KBaseEditorCell
      | KBaseOutputCell;
  };
  source: string;
}

export interface MarkdownCell extends Cell {
  cell_type: 'markdown';
  metadata: { kbase: KBaseCell };
  source: string;
}

export interface DataObject {
  name: string;
  obj_type: string;
  readableType?: string;
}

export interface NarrativeDoc {
  access_group: number;
  cells: Cell[];
  copied: boolean | null;
  creation_date: string;
  creator: string;
  data_objects: DataObject[];
  is_narratorial: boolean;
  is_public: boolean;
  is_temporary: boolean;
  modified_at: number;
  narrative_title: string;
  obj_id: number;
  obj_name: string;
  obj_type_module: string;
  obj_type_version: string;
  owner: string;
  shared_users: string[];
  tags: string[];
  timestamp: number;
  total_cells: number;
  version: number;
}

// for NarrativeList and children components
export type NarrativeListDoc = Pick<
  NarrativeDoc,
  | 'access_group'
  | 'creator'
  | 'narrative_title'
  | 'obj_id'
  | 'timestamp'
  | 'version'
>;

export const isKBaseCodeTypeCell = (
  kbase: KBaseCell
): kbase is KBaseCodeTypeCell => {
  return Object.hasOwn(kbase, 'type');
};

export const isKBaseAppCell = (kbase: KBaseCell): kbase is KBaseAppCell => {
  return isKBaseCodeTypeCell(kbase) ? kbase.type === 'app' : false;
};

export const isKBaseCodeCell = (kbase: KBaseCell): kbase is KBaseCodeCell => {
  return isKBaseCodeTypeCell(kbase) ? kbase.type === 'code' : false;
};

export const isKBaseDataCell = (kbase: KBaseCell): kbase is KBaseDataCell => {
  return isKBaseCodeTypeCell(kbase) ? kbase.type === 'data' : false;
};

export const isCodeCell = (kbase: Cell): kbase is CodeCell => {
  return kbase.cell_type === 'code';
};

export const isMarkdownCell = (kbase: Cell): kbase is MarkdownCell => {
  return kbase.cell_type === 'markdown';
};
