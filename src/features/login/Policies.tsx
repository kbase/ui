import policyStrings from 'kbase-policies';
import frontmatter from 'front-matter';

export const ENFORCED_POLICIES = ['kbase-user'];

interface PolicyMeta {
  title: string;
  id: string;
  version: number;
  equivalentVersions: number[];
}

interface PolciyInfo extends PolicyMeta {
  raw: string;
  markdown: string;
  olderVersions: PolciyInfo[];
}

export const getPolicies = ({ onlyEnforced }: { onlyEnforced: boolean }) =>
  policyStrings.reduce((policies, str) => {
    const parsed = frontmatter(str);
    const attr = parsed.attributes as PolicyMeta;
    const policy: PolciyInfo = {
      raw: str,
      markdown: parsed.body,
      title: String(attr.title) ?? '',
      id: String(attr.id) ?? '',
      version: Number(attr.version),
      equivalentVersions: (attr.equivalentVersions.map((v) => Number(v)) ??
        []) as number[],
      olderVersions: [],
    };
    if (!onlyEnforced || ENFORCED_POLICIES.includes(policy.id)) {
      if (!policies[policy.id]) {
        policies[policy.id] = policy;
      } else if (policies[policy.id].version < policy.version) {
        policy.olderVersions.push(policies[policy.id]);
        policies[policy.id] = policy;
      } else {
        policies[policy.id].olderVersions.push(policy);
      }
    }
    return policies;
  }, {} as Record<string, PolciyInfo>);

export const kbasePolicies = getPolicies({ onlyEnforced: true });
