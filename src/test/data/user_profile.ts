/**
 * The user profile for the CI test user "kbaseuitest". 
 * 
 * This is the result of a call to the user profile service's "UserProfile.get_user_profile" method.
 * curl -X POST https://ci.kbase.us/services/user_profile/rpc \
    -H 'Accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{
    "version": "1.1",
    "id": "123",
    "method": "UserProfile.get_user_profile",
    "params": [["eapearson"]]
  }'
 */

export const KBASEUITEST_PROFILE = {
  user: {
    username: 'kbaseuitest',
    realname: 'KBase UI Test User',
  },
  profile: {
    metadata: {
      createdBy: 'userprofile_ui_service',
      created: '2020-01-06T21:48:12.352Z',
    },
    preferences: {},
    userdata: {
      organization: '',
      department: '',
      affiliations: [
        {
          title: 'tester',
          organization: 'kbase / lbnl',
          started: 2020,
          ended: 2020,
        },
      ],
      city: '',
      state: 'California',
      postalCode: '',
      country: '',
      researchStatement:
        "Test user account for ui integration tests.\n\nPlease don't modify the profile.\n\nThis **can** be markdown, but who would know?",
      gravatarDefault: 'monsterid',
      avatarOption: 'gravatar',
      researchInterests: [
        'Comparative Genomics',
        'Genome Annotation',
        'Metabolic Modeling',
        'Read Processing',
        'Sequence Analysis',
      ],
      researchInterestsOther: null,
      jobTitleOther: 'My job',
      jobTitle: 'Other',
      fundingSource: '',
    },
    synced: {
      gravatarHash: 'b4d95f8595104614355e6ee9c4c03e3f',
    },
    plugins: {
      'data-search': {
        settings: {
          history: {
            search: {
              history: [
                'coli',
                'abcde12345',
                'Abiotrophi',
                'sphaeroides',
                'orientalis',
                'Abiotrophia',
                'marinus',
                'Prochlorococcus marinus str. GP2',
                'query-compost_hq_bins_blastp_output.Seq',
                'SequenceSet',
              ],
              time: {
                $numberLong: '1656371918191',
              },
            },
          },
        },
      },
      'jgi-search': {
        settings: {
          history: {
            search: {
              history: ['coli', 'blahblah', 'Colin'],
              time: {
                $numberLong: '1658255057551',
              },
            },
          },
          jgiDataTerms: {
            agreed: true,
            time: {
              $numberLong: '1580251462454',
            },
          },
        },
      },
      'public-search': {
        settings: {
          history: {
            history: [
              'prochlorococcus',
              'coli',
              'orientalis',
              'Acetobacter orientalis',
              'prochlorococcus marinus',
              'AnnotatedGenomeAssembly',
              'prochlorococcus marnius',
              'Prochlorococcus marinus str. GP2',
              'AnnotatedMetagenomeAssembly',
              'prochlorococcus unconfirmed',
            ],
            time: {
              $numberLong: '1656372755178',
            },
          },
        },
      },
    },
  },
};
