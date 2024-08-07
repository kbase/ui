/**
 * Constant values used by the orcidlink feature.
 *
 * A grab bag of values needed by the orcidlink ui.
 *
 * If a constat value is hardcoded, it should be moved here.
 */

export const MANAGER_ROLE = 'ORCIDLINK_MANAGER';

export type ORCIDScope = '/read-limited' | '/activities/update';

export const ALL_SCOPES: Array<ORCIDScope> = [
  '/read-limited',
  '/activities/update',
];

const SCOPE_USER = 'KBase';

export interface ScopeHelp {
  label: string;
  orcid: {
    label: string;
    tooltip: string;
  };
  help: Array<string>;
  seeAlso: Array<{ url: string; label: string }>;
}

export const SCOPE_HELP: { [K in ORCIDScope]: ScopeHelp } = {
  '/read-limited': {
    label: 'Read Limited',
    orcid: {
      label: `Allows ${SCOPE_USER} to read your information with visibility set to Trusted Organizations.`,
      tooltip: `Allows ${SCOPE_USER} to read any information from your record you have marked as available to \
            "Everyone" (public) or "Trusted parties". ${SCOPE_USER} cannot read information you have marked as "Only me" (private).`,
    },
    help: [
      `${SCOPE_USER} accesses your ORCID® profile to show relevant information in the KBase ORCID® Link tool (available only to you), and to assist in filling out forms`,
    ],
    seeAlso: [
      {
        url: 'https://support.orcid.org/hc/en-us/articles/360006973893-Trusted-organizations',
        label: 'About ORCID® Trusted Parties',
      },
    ],
  },
  '/activities/update': {
    label: 'Update Activities',
    orcid: {
      label: `Allows ${SCOPE_USER} to add/update your research activities (works, affiliations, etc).`,
      tooltip: `Allows ${SCOPE_USER} to add information about your research activites \
            (for example, works, affiliations) that is stored in the ${SCOPE_USER} system(s) to your \
            ORCID® record. ${SCOPE_USER} will also be able to update research activites \
            ${SCOPE_USER} has added, but will not be able to edit information added by you or \
            any other trusted organization.`,
    },
    help: [
      'In the future, you may use this feature to automatically share published "FAIR Narratives" in your ORCID® account.',
    ],
    seeAlso: [
      {
        url: 'https://support.orcid.org/hc/en-us/articles/360006973893-Trusted-organizations',
        label: 'About ORCID® Trusted Organizations',
      },
    ],
  },
};

function image_url(filename: string): string {
  return `${process.env.PUBLIC_URL}/assets/features/orcidlink/images/${filename}`;
}

export const ORCID_ICON_URL = image_url('ORCID-iD_icon-vector.svg');
export const ORCID_SIGN_IN_SCREENSHOT_URL = image_url('ORCID-sign-in.png');

export const ORCID_LABEL = 'ORCID®';

export const ORCID_LINK_LABEL = `KBase ${ORCID_LABEL} Link`;
