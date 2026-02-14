import { SelectOption } from '../../common/components/Select';
import countriesData from './data/countries.json';
import fundingSourcesData from './data/fundingSources.json';
import institutionsData from './data/institutions.json';

const toSelectOptions = (items: string[]): SelectOption[] =>
  items.map((item) => ({ label: item, value: item }));

export const JOB_TITLES: SelectOption[] = toSelectOptions([
  'CEO',
  'CSO',
  'Scientific Director',
  'Principal Investigator',
  'Co-investigator',
  'Staff Scientist',
  'Research Associate',
  'Postdoctoral Scientist',
  'Graduate Student',
  'Undergraduate Student',
  'Assistant Professor',
  'Associate Professor',
  'Professor',
  'Physician',
  'Other',
]);

export const RESEARCH_INTERESTS: string[] = [
  'Comparative Genomics',
  'Expression',
  'Genome Annotation',
  'Genome Assembly',
  'Microbial Communities',
  'Metabolic Modeling',
  'Read Processing',
  'Sequence Analysis',
  'Utilities',
  'Other',
];

export const US_STATES: SelectOption[] = toSelectOptions([
  'Alabama',
  'Alaska',
  'American Samoa',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'District Of Columbia',
  'Federated States Of Micronesia',
  'Florida',
  'Georgia',
  'Guam',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Marshall Islands',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Northern Mariana Islands',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Palau',
  'Pennsylvania',
  'Puerto Rico',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virgin Islands',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
]);

export const GRAVATAR_DEFAULTS: SelectOption[] = [
  {
    value: 'mm',
    label: 'Mystery Man - simple, cartoon-style silhouetted outline',
  },
  {
    value: 'identicon',
    label: 'Identicon - a geometric pattern based on an email hash',
  },
  {
    value: 'monsterid',
    label: 'MonsterID - generated "monster" with different colors, faces, etc',
  },
  {
    value: 'wavatar',
    label: 'Wavatar - generated faces with differing features and backgrounds',
  },
  {
    value: 'retro',
    label: 'Retro - 8-bit arcade-style pixelated faces',
  },
];

export const AVATAR_OPTIONS: SelectOption[] = [
  {
    value: 'gravatar',
    label:
      'Gravatar - Use your Gravatar image, otherwise the Default Image selected below',
  },
  {
    value: 'silhouette',
    label: 'Silhouette - simple, anonymous, featureless silhouette',
  },
];

export const COUNTRIES: SelectOption[] = toSelectOptions(
  countriesData as string[]
);

export const FUNDING_SOURCES: SelectOption[] = toSelectOptions(
  fundingSourcesData as string[]
);

export const INSTITUTIONS: SelectOption[] = toSelectOptions(
  institutionsData as string[]
);
