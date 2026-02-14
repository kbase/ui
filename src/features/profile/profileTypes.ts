export interface Affiliation {
  title: string;
  organization: string;
  started: number; // year, e.g. 2020
  ended: number | null; // year or null for "Present"
}

export interface UserData {
  organization: string;
  department: string;
  affiliations: Affiliation[];
  city: string;
  state: string;
  postalCode: string;
  country: string;
  researchStatement: string;
  gravatarDefault: string; // 'monsterid' | 'identicon' | 'mm' | 'wavatar' | 'retro'
  avatarOption: string; // 'gravatar' | 'silhouette'
  researchInterests: string[];
  researchInterestsOther: string | null;
  jobTitle: string;
  jobTitleOther: string;
  fundingSource: string;
}

export interface ProfileData {
  metadata: {
    createdBy: string;
    created: string;
  };
  preferences: Record<string, unknown>;
  userdata: UserData;
  synced: {
    gravatarHash: string;
  };
  plugins?: Record<string, unknown>;
}
