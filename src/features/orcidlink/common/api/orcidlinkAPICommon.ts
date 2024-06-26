export interface ORCIDAuthPublic {
  expires_in: number;
  name: string;
  orcid: string;
  scope: string;
}

export interface LinkRecordPublic {
  created_at: number;
  expires_at: number;
  retires_at: number;
  username: string;
  orcid_auth: ORCIDAuthPublic;
}

export interface ORCIDAuthPublicNonOwner {
  orcid: string;
  name: string;
}

export interface LinkRecordPublicNonOwner {
  username: string;
  orcid_auth: ORCIDAuthPublicNonOwner;
}

// ORCID User Profile

export interface Affiliation {
  name: string;
  role: string;
  startYear: string;
  endYear: string | null;
}

export interface ORCIDFieldGroupBase {
  private: boolean;
}

export interface ORCIDFieldGroupPrivate extends ORCIDFieldGroupBase {
  private: true;
}

export interface ORCIDFieldGroupAccessible<T> extends ORCIDFieldGroupBase {
  private: false;
  fields: T;
}

export type ORCIDFieldGroup<T> =
  | ORCIDFieldGroupPrivate
  | ORCIDFieldGroupAccessible<T>;

export interface ORCIDNameFieldGroup {
  firstName: string;
  lastName: string | null;
  creditName: string | null;
}

export interface ORCIDBiographyFieldGroup {
  bio: string;
}

export interface ORCIDEmailFieldGroup {
  emailAddresses: Array<string>;
}

export interface ORCIDProfile {
  orcidId: string;
  nameGroup: ORCIDFieldGroup<ORCIDNameFieldGroup>;
  biographyGroup: ORCIDFieldGroup<ORCIDBiographyFieldGroup>;
  emailGroup: ORCIDFieldGroup<ORCIDEmailFieldGroup>;
  employments: Array<Affiliation>;
}
