import policyStrings from 'kbase-policies';
import frontmatter from 'front-matter';

export const ENFORCED_POLICIES = ['kbase-user'];

interface PolicyMeta {
  title: string;
  id: string;
  version: string;
  equivalentVersions: string[];
}

export const kbasePolicies = policyStrings.reduce(
  (policies, str) => {
    const parsed = frontmatter(str);
    const attr = parsed.attributes as PolicyMeta;
    const policy = {
      raw: str,
      markdown: parsed.body,
      title: String(attr.title) ?? '',
      id: String(attr.id) ?? '',
      version: String(attr.version) ?? '',
      equivalentVersions: (attr.equivalentVersions ?? []) as string[],
    };
    if (ENFORCED_POLICIES.includes(policy.id)) policies[policy.id] = policy;
    return policies;
  },
  {} as Record<
    string,
    PolicyMeta & {
      raw: string;
      markdown: string;
    }
  >
);
