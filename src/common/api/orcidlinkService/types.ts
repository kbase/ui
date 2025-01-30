// Common Types
export type CitationType =
  | 'bibtex'
  | 'formatted-apa'
  | 'formatted-chicago'
  | 'formatted-harvard'
  | 'formatted-ieee'
  | 'formatted-mla'
  | 'formatted-vancouver'
  | 'formatted-unspecified'
  | 'ris';

export type RelationshipType = 'self' | 'part-of' | 'version-of' | 'funded-by';

export type ContributorRoleValue =
  | 'http://credit.niso.org/contributor-roles/conceptualization/'
  | 'http://credit.niso.org/contributor-roles/data-curation/'
  | 'http://credit.niso.org/contributor-roles/formal-analysis/'
  | 'http://credit.niso.org/contributor-roles/funding-acquisition/'
  | 'http://credit.niso.org/contributor-roles/investigation/'
  | 'http://credit.niso.org/contributor-roles/methodology/'
  | 'http://credit.niso.org/contributor-roles/project-administration/'
  | 'http://credit.niso.org/contributor-roles/resources/'
  | 'http://credit.niso.org/contributor-roles/software/'
  | 'http://credit.niso.org/contributor-roles/supervision/'
  | 'http://credit.niso.org/contributor-roles/validation/'
  | 'http://credit.niso.org/contributor-roles/visualization/'
  | 'http://credit.niso.org/contributor-roles/writing-original-draft/'
  | 'http://credit.niso.org/contributor-roles/writing-review-editing/';

export interface ExternalId {
  type: string;
  value: string;
  url: string;
  relationship: RelationshipType;
}

export interface ORCIDCitation {
  type: CitationType;
  value: string;
}

export interface ContributorRole {
  role: ContributorRoleValue;
}

export interface ORCIDContributor {
  orcidId?: string;
  name: string;
  roles: ContributorRole[];
}

export interface ORCIDContributorSelf {
  orcidId: string;
  name: string;
  roles: ContributorRole[];
}

export type WorkType =
  | 'book'
  | 'book-chapter'
  | 'book-review'
  | 'dictionary-entry'
  | 'dissertation'
  | 'dissertation-thesis'
  | 'encyclopedia-entry'
  | 'edited-book'
  | 'journal-article'
  | 'journal-issue'
  | 'magazine-article'
  | 'manual'
  | 'online-resource'
  | 'newsletter-article'
  | 'newspaper-article'
  | 'preprint'
  | 'report'
  | 'review'
  | 'research-tool'
  | 'supervised-student-publication'
  | 'test'
  | 'translation'
  | 'website'
  | 'working-paper'
  | 'conference-abstract'
  | 'conference-paper'
  | 'conference-poster'
  | 'disclosure'
  | 'license'
  | 'patent'
  | 'registered-copyright'
  | 'trademark'
  | 'annotation'
  | 'artistic-performance'
  | 'data-management-plan'
  | 'data-set'
  | 'invention'
  | 'lecture-speech'
  | 'physical-object'
  | 'research-technique'
  | 'software'
  | 'spin-off-company'
  | 'standards-and-policy'
  | 'technical-standard'
  | 'other';

export interface Work {
  putCode: number;
  createdAt: number;
  updatedAt?: number;
  source?: string;
  title: string;
  date: string;
  workType: WorkType;
  url: string;
  doi: string;
  externalIds: ExternalId[];
  journal: string;
  shortDescription: string;
  citation: ORCIDCitation;
  selfContributor: ORCIDContributorSelf;
  otherContributors: ORCIDContributor[];
}

export type NewWork = Omit<
  Work,
  'putCode' | 'createdAt' | 'updatedAt' | 'source'
>;

export interface WorkUpdate extends NewWork {
  putCode: number;
}

export interface WorkSummary {
  putCode: number;
  createdAt: number;
  updatedAt?: number;
  source?: string;
  title: string;
  date: string;
  workType: WorkType;
  url: string;
  doi: string;
  externalIds: ExternalId[];
  journal?: string;
}

export interface ORCIDWorkGroup {
  updatedAt: number;
  externalIds: ExternalId[];
  works: WorkSummary[];
}

// ORCID Profile types
export interface ORCIDAffiliation {
  name: string;
  role: string;
  startYear: string;
  endYear: string | null;
}

export interface ORCIDFieldGroup<T> {
  private: boolean;
  fields: T | null;
}

export interface ORCIDNameFields {
  firstName: string;
  lastName: string | null;
  creditName: string | null;
}

export interface ORCIDBiographyFields {
  bio: string;
}

export interface ORCIDEmailFields {
  emailAddresses: string[];
}

export interface ORCIDProfile {
  orcidId?: string;
  nameGroup: ORCIDFieldGroup<ORCIDNameFields>;
  biographyGroup: ORCIDFieldGroup<ORCIDBiographyFields>;
  emailGroup: ORCIDFieldGroup<ORCIDEmailFields>;
  employment: ORCIDAffiliation[];
}

// Auth types
export interface ORCIDAuthPublic {
  expires_in: number;
  name: string;
  orcid: string;
  scope: string;
}

export interface ORCIDAuthPublicNonOwner {
  orcid: string;
  name: string;
}

export interface LinkRecordPublic {
  created_at: number;
  expires_at: number;
  retires_at: number;
  username: string;
  orcid_auth: ORCIDAuthPublic;
}

export interface LinkRecordPublicNonOwner {
  username: string;
  orcid_auth: ORCIDAuthPublicNonOwner;
}

// Search types
export interface FilterByUsername {
  eq?: string;
  contains?: string;
}

export interface FilterByORCIDId {
  eq: string;
}

export interface FilterByEpochTime {
  eq?: number;
  gte?: number;
  gt?: number;
  lte?: number;
  lt?: number;
}

export interface QuerySort {
  specs: Array<{
    field_name: string;
    descending?: boolean;
  }>;
}

export interface SearchQuery {
  find?: {
    username?: FilterByUsername;
    orcid?: FilterByORCIDId;
    created?: FilterByEpochTime;
    expires?: FilterByEpochTime;
  };
  sort?: QuerySort;
  offset?: number;
  limit?: number;
}
