/**
 * Test data from the NarrativeMethodStore service.
 *
 * All data is from live calls to the CI instance of NMS in June 2024.
 *
 * All data represents just the data needed for testing. For instance, it is
 * unwrapped from the rpc structure and the results array.
 */

/**
 * Result of a call to the  "NarrativeMethodStore.status" method
 * 
 * curl -X POST https://ci.kbase.us/services/narrative_method_store/rpc \
    -d '{
  "version": "1.1",
  "id": "123",
  "method": "NarrativeMethodStore.status",
  "params": []
  }'
 */
export const STATUS_1 = {
  git_spec_url: 'https://github.com/kbase/narrative_method_specs_ci',
  git_spec_branch: 'master',
  git_spec_commit:
    'commit 042b36d193054ccb42f7e3a89d35c2a9989ecceb\nMerge: 7c58bbd 952d3d4\nAuthor: Bill Riehl <briehl@users.noreply.github.com>\nDate:   Wed Nov 10 12:41:27 2021 -0800\n\n    Merge pull request #110 from qzzhang/master\n    \n    Added the KBaseStructure structure types\n',
  update_interval: '5',
};

/**
 * An example app "brief info". The data represents just the brief info for the
 * single app requested, rather than the array returned in the actual result.
 * 
 * curl -X POST https://ci.kbase.us/services/narrative_method_store/rpc \
    -d '{
  "version": "1.1",
  "id": "123",
  "method": "NarrativeMethodStore.get_method_brief_info",
  "params": [{"ids": ["NarrativeViewers/view_assembly"]}]
  }'
 */
export const VIEW_ASSEMBLY_BRIEF_INFO_1 = {
  id: 'NarrativeViewers/view_assembly',
  module_name: 'NarrativeViewers',
  git_commit_hash: '0851ff66474b615dcf447499d133885a09adc862',
  name: 'View Assembly',
  ver: '1.0.8',
  subtitle: 'View and explore an Assembly object in your workspace. [5]',
  tooltip: 'View and explore an Assembly in your workspace. [5]',
  categories: ['viewers'],
  authors: [],
  input_types: ['KBaseGenomeAnnotations.Assembly', 'KBaseGenomes.ContigSet'],
  output_types: [],
  app_type: 'viewer',
  namespace: 'NarrativeViewers',
};
